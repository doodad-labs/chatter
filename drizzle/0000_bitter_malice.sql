CREATE TABLE `telegramChannels` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`channelId` int NOT NULL,
	`title` varchar(255),
	`username` varchar(32),
	`founded` timestamp NOT NULL,
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `telegramChannels_id` PRIMARY KEY(`id`),
	CONSTRAINT `telegramChannels_channelId_unique` UNIQUE(`channelId`),
	CONSTRAINT `telegramChannels_username_unique` UNIQUE(`username`)
);
