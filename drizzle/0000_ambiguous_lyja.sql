CREATE TABLE `chatter` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`message` text NOT NULL,
	`attachments` text,
	`sent` timestamp NOT NULL DEFAULT (now()),
	`platform` enum('discord','telegram') NOT NULL,
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `chatter_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `discord` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`chatter_id` int unsigned NOT NULL,
	`channelId` varchar(255) NOT NULL,
	`guildId` varchar(255),
	`authorId` varchar(255) NOT NULL,
	`messageId` varchar(255) NOT NULL,
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `discord_id` PRIMARY KEY(`id`),
	CONSTRAINT `discord_chatter_id_unique` UNIQUE(`chatter_id`)
);
--> statement-breakpoint
CREATE TABLE `telegram` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`chatter_id` int unsigned NOT NULL,
	`chatId` varchar(255),
	`channelId` varchar(255),
	`fromId` varchar(255),
	`messageId` varchar(255) NOT NULL,
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `telegram_id` PRIMARY KEY(`id`),
	CONSTRAINT `telegram_chatter_id_unique` UNIQUE(`chatter_id`)
);
--> statement-breakpoint
ALTER TABLE `discord` ADD CONSTRAINT `discord_chatter_id_chatter_id_fk` FOREIGN KEY (`chatter_id`) REFERENCES `chatter`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `telegram` ADD CONSTRAINT `telegram_chatter_id_chatter_id_fk` FOREIGN KEY (`chatter_id`) REFERENCES `chatter`(`id`) ON DELETE no action ON UPDATE no action;