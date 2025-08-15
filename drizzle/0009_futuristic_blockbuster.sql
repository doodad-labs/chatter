CREATE TABLE `telegramChatter` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`chatId` varchar(255),
	`channelId` varchar(255),
	`fromId` varchar(255),
	`messageId` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`sent` timestamp NOT NULL,
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `telegramChatter_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP TABLE `telegramChannelChatter`;--> statement-breakpoint
DROP TABLE `telegramChatChatter`;