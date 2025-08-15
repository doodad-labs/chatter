CREATE TABLE `telegramChatChatter` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`chatId` varchar(255) NOT NULL,
	`fromId` varchar(255) NOT NULL,
	`messageId` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`sent` timestamp NOT NULL,
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `telegramChatChatter_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
RENAME TABLE `telegramChatter` TO `telegramChannelChatter`;--> statement-breakpoint
ALTER TABLE `telegramChannelChatter` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `telegramChannelChatter` ADD PRIMARY KEY(`id`);