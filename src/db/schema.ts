import { mysqlTable, serial, varchar, timestamp, text, int, mysqlEnum } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

export const telegram = mysqlTable('telegram', {
  id: serial().primaryKey(),

  chatterId: int('chatter_id', { unsigned: true }).notNull().unique().references(() => chatter.id),

  chatId: varchar({ length: 255 }),  
  channelId: varchar({ length: 255 }), 
  fromId: varchar({ length: 255 }),  
  messageId: varchar({ length: 255 }).notNull(),  // Unique identifier for the message, required

  updated_at: timestamp().defaultNow().onUpdateNow(), // Timestamp for the last update, defaults to current time on creation and update
  created_at: timestamp().defaultNow()                // Timestamp for database creation, defaults to current time
});

export const discord = mysqlTable('discord', {
  id: serial().primaryKey(),

  chatterId: int('chatter_id', { unsigned: true }).notNull().unique().references(() => chatter.id),

  channelId: varchar({ length: 255 }).notNull(),    // Foreign key to discordChannels, required
  guildId: varchar({ length: 255 }),                // Foreign key to discordGuildIds, required
  authorId: varchar({ length: 255 }).notNull(),     // Unique identifier for the user who sent the message, required
  messageId: varchar({ length: 255 }).notNull(),    // Unique identifier for the message, required

  updated_at: timestamp().defaultNow().onUpdateNow(), // Timestamp for the last update, defaults to current time on creation and update
  created_at: timestamp().defaultNow()                // Timestamp for database creation, defaults to current time
});

export const attachment = mysqlTable('attachment', {
  id: serial().primaryKey(),

  chatterId: int('chatter_id', { unsigned: true }).notNull().references(() => chatter.id),
  name: text().notNull(),
  hash: text().notNull(),
  size: int('size', { unsigned: true }).notNull(),
  contentType: text().notNull(),
  content: text().notNull(),

  updated_at: timestamp().defaultNow().onUpdateNow(),
  created_at: timestamp().defaultNow()
});

export const chatter = mysqlTable('chatter', {
  id: int('id', { unsigned: true }).primaryKey().autoincrement(),

  message: text(),
  sent: timestamp().notNull().defaultNow(),

  platform: mysqlEnum(['discord', 'telegram']).notNull(), 

  updated_at: timestamp().defaultNow().onUpdateNow(),
  created_at: timestamp().defaultNow()
});

export const chatterRelations = relations(chatter, ({ one }) => ({
  discord: one(discord, {
    fields: [chatter.id],
    references: [discord.chatterId],
  }),
  telegram: one(telegram, {
    fields: [chatter.id],
    references: [telegram.chatterId],
  }),
}));