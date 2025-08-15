import { mysqlTable, serial, varchar, timestamp, text, boolean } from 'drizzle-orm/mysql-core';

export const telegramChannels = mysqlTable('telegramChannels', {
  id: serial().primaryKey(),

  channelId: varchar({ length: 255 }).notNull().unique(), // Unique identifier for the channel, required
  title: varchar({ length: 255 }),                        // All channels are required to have a title
  username: varchar({ length: 32 }).unique(),             // Username is optional, but if it exists, it must be unique
  founded: timestamp().notNull(),                         // Timestamp when the channel was founded, required
  joined: boolean().default(false),                       // Indicates if the bot has joined the channel, defaults to false

  updated_at: timestamp().defaultNow().onUpdateNow(), // Timestamp for the last update, defaults to current time on creation and update
  created_at: timestamp().defaultNow()                // Timestamp for database creation, defaults to current time
});

export const telegramChats = mysqlTable('telegramChats', {
  id: serial().primaryKey(),

  chatId: varchar({ length: 255 }).notNull().unique(), // Unique identifier for the channel, required
  title: varchar({ length: 255 }),                        // All channels are required to have a title
  founded: timestamp().notNull(),                         // Timestamp when the channel was founded, required
  joined: boolean().default(false),                       // Indicates if the bot has joined the channel, defaults to false

  updated_at: timestamp().defaultNow().onUpdateNow(), // Timestamp for the last update, defaults to current time on creation and update
  created_at: timestamp().defaultNow()                // Timestamp for database creation, defaults to current time
});

export const telegramChatter = mysqlTable('telegramChatter', {
  id: serial().primaryKey(),

  chatId: varchar({ length: 255 }),     // Foreign key to telegramChannels, required
  channelId: varchar({ length: 255 }), // Foreign key to telegramChannels, required
  fromId: varchar({ length: 255 }),     // Unique identifier for the user who sent the message, required
  messageId: varchar({ length: 255 }).notNull(),  // Unique identifier for the message, required
  message: text().notNull(),      // The content of the message, required
  sent: timestamp().notNull(),    // Timestamp when the message was sent, required

  updated_at: timestamp().defaultNow().onUpdateNow(), // Timestamp for the last update, defaults to current time on creation and update
  created_at: timestamp().defaultNow()                // Timestamp for database creation, defaults to current time
});

export const discordChatter = mysqlTable('discordChatter', {
  id: serial().primaryKey(),

  channelId: varchar({ length: 255 }).notNull(),    // Foreign key to discordChannels, required
  guildId: varchar({ length: 255 }),                // Foreign key to discordGuildIds, required
  authorId: varchar({ length: 255 }).notNull(),     // Unique identifier for the user who sent the message, required
  messageId: varchar({ length: 255 }).notNull(),    // Unique identifier for the message, required
  message: text().notNull(),      // The content of the message, required
  sent: timestamp().notNull(),    // Timestamp when the message was sent, required

  updated_at: timestamp().defaultNow().onUpdateNow(), // Timestamp for the last update, defaults to current time on creation and update
  created_at: timestamp().defaultNow()                // Timestamp for database creation, defaults to current time
});
