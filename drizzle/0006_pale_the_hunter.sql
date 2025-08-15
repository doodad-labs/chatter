CREATE TABLE `telegramChats` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`chatId` varchar(255) NOT NULL,
	`title` varchar(255),
	`founded` timestamp NOT NULL,
	`joined` boolean DEFAULT false,
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `telegramChats_id` PRIMARY KEY(`id`),
	CONSTRAINT `telegramChats_chatId_unique` UNIQUE(`chatId`)
);
