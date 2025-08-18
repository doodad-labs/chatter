import 'dotenv/config';
import { Client } from 'discord.js-selfbot-v13';

import { eq } from 'drizzle-orm';
import { chatter, discord } from '../db/schema';

export default async function (db) {
    const client = new Client();

    client.on('ready', async () => {
        console.log(`Discord ready logged in as ${client.user?.username}!`);
        console.log('Listening for messages...');
    })

    client.on('messageCreate', async message => {
        // Avoid infinite loops by ignoring our own messages
        if (message.author.id === client.user?.id) return;
        if (message.content.trim() === '') return;

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