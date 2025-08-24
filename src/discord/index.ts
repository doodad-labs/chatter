import 'dotenv/config';
import { Client } from 'discord.js-selfbot-v13';
import { createHash } from 'crypto';
import { eq } from 'drizzle-orm';
import { chatter, discord, attachment } from '../db/schema';
import filter from '../utils/filter';

const MAX_ATTACHMENT_SIZE = 8 * 1024 * 1024; // 8 MB

export default async function (db) {
    const client = new Client();

    client.on('ready', async () => {
        console.log(`Discord ready logged in as ${client.user?.username}!`);
        console.log('Listening for messages...');
    })

    client.on('messageCreate', async message => {

        // Avoid infinite loops by ignoring our own messages
        if (message.author.id === client.user?.id) return;

        let attachments: {
            name: string | null;
            content: string;
            hash: string;
            contentType: string | null;
            size: number;
        }[] = [];

        if (message.attachments.size > 0) {
            attachments = await Promise.allSettled(message.attachments.map(async (attachment) => {
                if (attachment.size > MAX_ATTACHMENT_SIZE) {
                    return;
                }

                // Dont download images
                if (attachment.contentType?.startsWith('image/') || attachment.height) {
                    return;
                }

                // Dont download audio
                if (attachment.contentType?.startsWith('audio/')) {
                    return;
                }

                // Download everything else
                const response = await fetch(attachment.url);
                if (!response.ok) {
                    console.error('Failed to download attachment:', attachment.url);
                    return;
                }

                let content: string;
                
                if (attachment.contentType?.startsWith('text/')) {
                    content = await response.text();
                } else {
                    content = await response.arrayBuffer().then(buffer => {
                        return Buffer.from(buffer).toString('base64');
                    });
                }

                const hash = createHash('sha256');
                hash.update(content);
                const hashHex = hash.digest('hex');

                return {
                    name: attachment.name,
                    content: content,
                    hash: hashHex,
                    contentType: attachment.contentType,
                    size: attachment.size
                }

            })).then((results) => {
                return results.filter((result) => result.status === 'fulfilled').map((result) => result.value);
            }).catch((error) => {
                console.error('Failed to download attachments:', error);
                return [];
            });
        }

        if (message.content.trim() === '' && attachments.length === 0) return;
        if (filter(message.content) && attachments.length === 0) return;

        const exists = await db.select().from(discord).where(eq(discord.messageId, message.id.toString())).limit(1);
        if (exists.length === 0) {

            const chatterObject: typeof chatter.$inferInsert = {
                message: message.content.trim(),
                sent: new Date(message.createdTimestamp),
                platform: 'discord',
            };

            try {
                await db.transaction(async (tx) => {
                    const insertedChatter = await tx.insert(chatter).values(chatterObject);
                    const discordObject: typeof discord.$inferInsert = {
                        chatterId: Number(insertedChatter[0].insertId),
                        channelId: message.channelId.toString(),
                        guildId: message.guildId ? message.guildId.toString() : null,
                        authorId: message.author.id.toString(),
                        messageId: message.id.toString(),
                    };

                    await tx.insert(discord).values(discordObject);

                    if (attachments.length === 0) return;

                    for (const attach of attachments) {

                        if (!attach.name || !attach.content || !attach.hash || !attach.contentType || !attach.size) continue;

                        const attachmentObject: typeof attachment.$inferInsert = {
                            chatterId: Number(insertedChatter[0].insertId),
                            name: attach.name,
                            content: attach.content,
                            hash: attach.hash,
                            contentType: attach.contentType,
                            size: attach.size,
                        };

                        await tx.insert(attachment).values(attachmentObject);
                    }

                });

            } catch (error) {
                console.error("Failed to insert chatter + telegram:", error);
            }
        }

    });

    client.login(process.env.DISCORD_TOKEN).catch((error) => {
        console.error("Failed to login to Discord:", error);
        process.exit(1);
    });
}