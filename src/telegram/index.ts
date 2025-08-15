import 'dotenv/config';
import input from "input";

import { eq } from 'drizzle-orm';
import { telegramChannels, telegramChatter, telegramChats } from '../db/schema';

import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { NewMessage, NewMessageEvent } from "telegram/events";

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

    // fetch all channels that the user has joined
    const dialogs = await client.getDialogs();

    // reset all channels and chats in the database
    await db.update(telegramChannels).set({ joined: false });
    await db.update(telegramChats).set({ joined: false });

    for (const dialog of dialogs) {
        const entity = dialog.entity;

        if (entity && entity.className === 'Channel' && dialog.isChannel) {

            const channelObject: typeof telegramChannels.$inferInsert = {
                channelId: entity.id.toString(),
                title: entity.title,
                username: entity.username,
                joined: true,
                founded: new Date(entity.date * 1000)
            };

            const exists = await db.select().from(telegramChannels).where(eq(telegramChannels.channelId, channelObject.channelId)).limit(1);

            if (exists.length === 1) {
                try {
                    await db.update(telegramChannels).set(channelObject).where(eq(telegramChannels.channelId, channelObject.channelId))
                } catch (error) {
                    console.log(error)
                }
            } else {
                try {
                    await db.insert(telegramChannels).values(channelObject)
                } catch (error) {
                    console.log(error)
                }
            }

        } 

        if (entity && entity.className === 'Chat' && dialog.isGroup) {

            const chatObject: typeof telegramChats.$inferInsert = {
                chatId: entity.id.toString(),
                title: entity.title,
                joined: true,
                founded: new Date(entity.date * 1000)
            };

            const exists = await db.select().from(telegramChats).where(eq(telegramChats.chatId, chatObject.chatId)).limit(1);

            if (exists.length === 1) {
                try {
                    await db.update(telegramChats).set(chatObject).where(eq(telegramChats.chatId, chatObject.chatId))
                } catch (error) {
                    console.log(error)
                }
            } else {
                try {
                    await db.insert(telegramChats).values(chatObject)
                } catch (error) {
                    console.log(error)
                }
            }

        }
    }

    console.log('Telegram channels and chats updated in the database!');
    console.log('Listening for new messages...');

    // start listening to new messages from all joined channels
    client.addEventHandler(async (event: NewMessageEvent) => {

        if (event.message.message.trim() === '') return;

        // Channel Messages
        if (event.message.peerId.className === 'PeerChannel') {

            const exists = await db.select().from(telegramChatter).where(eq(telegramChatter.messageId, event.message.id.toString())).limit(1);
            if (exists.length === 0) {
                const chatterObject: typeof telegramChatter.$inferInsert = {
                    channelId: event.message.peerId.channelId.toString(),
                    messageId: event.message.id.toString(),
                    message: event.message.message.trim(),
                    sent: new Date(event.message.date * 1000), // Convert from seconds to milliseconds
                };

                try {
                    await db.insert(telegramChatter).values(chatterObject);
                } catch (error) {
                    console.log(error);
                }
            }

            return;
        }

        // Chat Messages
        if (event.message.peerId.className === 'PeerChat') {

            const exists = await db.select().from(telegramChatter).where(eq(telegramChatter.messageId, event.message.id.toString())).limit(1);
            if (exists.length === 0) {
                const chatterObject: typeof telegramChatter.$inferInsert = {
                    chatId: event.message.peerId.chatId.toString(),
                    fromId: event.message.fromId ? event.message.fromId.userId.toString() : 'Unknown',
                    messageId: event.message.id.toString(),
                    message: event.message.message.trim(),
                    sent: new Date(event.message.date * 1000), // Convert from seconds to milliseconds
                };

                try {
                    await db.insert(telegramChatter).values(chatterObject);
                } catch (error) {
                    console.log(error);
                }
            }

            return;
        }

        console.log('Unhandled message type:', event.message.peerId.className);

    }, new NewMessage({}));

}