CREATE TABLE `telegramChatter` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`channelId` varchar(255) NOT NULL,
	`messageId` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`sent` timestamp NOT NULL,
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `telegramChatter_id` PRIMARY KEY(`id`)
);
