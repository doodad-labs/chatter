import 'dotenv/config';
import input from "input";

import { and, eq } from 'drizzle-orm';
import { chatter, telegram } from '../db/schema';

import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { NewMessage, NewMessageEvent } from "telegram/events";

import filter from '../utils/filter';

const stringSession = new StringSession(process.env.TELEGRAM_SESSION);

export default async function (db) {

    const client = new TelegramClient(stringSession, parseInt(process.env.TELEGRAM_API_ID || ''), process.env.TELEGRAM_API_HASH ?? '', {
        connectionRetries: 5,
    });

    await client.start({
        phoneNumber: process.env.TELEGRAM_PHONE_NUMBER || (async () => await input.text("Please enter your phone number: ")),
        password: process.env.TELEGRAM_PASSWORD ? async () => process.env.TELEGRAM_PASSWORD! : async () => await input.text("Please enter your password: "),
        phoneCode: process.env.TELEGRAM_SESSION ? async () => '' : async () => await input.text("Please enter the code you received: "),
        onError: (err) => console.log(err),
    });

    const session = client.session.save()

    if (session !== process.env.TELEGRAM_SESSION) {
        console.log('NEW SESSION TOKEN:', session)
    }

    console.log('Telegram client started successfully!');
    console.log('Listening for new messages...');

    // start listening to new messages from all joined channels
    client.addEventHandler(async (event: NewMessageEvent) => {

        if (event.message.message.trim() === '') return;
        if (filter(event.message.message)) return;

        // Channel Messages
        if (event.message.peerId.className === 'PeerChannel') {

            const exists = await db.select().from(telegram).where(and(eq(telegram.messageId, event.message.id.toString()), eq(telegram.channelId, event.message.peerId.channelId.toString()))).limit(1);
            if (exists.length === 0) {

                const chatterObject: typeof chatter.$inferInsert = {
                    message: event.message.message.trim(),
                    sent: new Date(event.message.date * 1000),
                    platform: 'telegram',
                };

                try {
                    await db.transaction(async (tx) => {
                        const insertedChatter = await tx.insert(chatter).values(chatterObject);
                        const telegramObject: typeof telegram.$inferInsert = {
                            chatterId: Number(insertedChatter[0].insertId),
                            channelId: event.message.peerId.channelId.toString(), 
                            messageId: event.message.id.toString(),
                        };

                        await tx.insert(telegram).values(telegramObject);
                    });

                } catch (error) {
                    console.error("Failed to insert chatter + telegram:", error);
                }
            }

            return;
        }

        // Chat Messages
        if (event.message.peerId.className === 'PeerChat') {

            const exists = await db.select().from(telegram).where(and(eq(telegram.messageId, event.message.id.toString()), eq(telegram.chatId, event.message.peerId.chatId.toString()))).limit(1);

            if (exists.length === 0) {

                const chatterObject: typeof chatter.$inferInsert = {
                    message: event.message.message.trim(),
                    sent: new Date(event.message.date * 1000),
                    platform: 'telegram',
                };

                try {
                    await db.transaction(async (tx) => {
                        const insertedChatter = await tx.insert(chatter).values(chatterObject);
                        const telegramObject: typeof telegram.$inferInsert = {
                            chatterId: Number(insertedChatter[0].insertId),
                            chatId: event.message.peerId.chatId.toString(),
                            fromId: event.message.fromId ? event.message.fromId.userId.toString() : 'Unknown',
                            messageId: event.message.id.toString(),
                        };

                        await tx.insert(telegram).values(telegramObject);
                    });

                } catch (error) {
                    console.error("Failed to insert chatter + telegram:", error);
                }
            }

            return;
        }

        console.log('Unhandled message type:', event.message.peerId.className);

    }, new NewMessage({}));

}