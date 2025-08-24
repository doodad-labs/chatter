CREATE TABLE `attachment` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`chatter_id` int unsigned NOT NULL,
	`name` text NOT NULL,
	`hash` text NOT NULL,
	`size` int unsigned NOT NULL,
	`contentType` text NOT NULL,
	`content` text NOT NULL,
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `attachment_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `attachment` ADD CONSTRAINT `attachment_chatter_id_chatter_id_fk` FOREIGN KEY (`chatter_id`) REFERENCES `chatter`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chatter` DROP COLUMN `attachments`;