PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text(100) NOT NULL,
	`kind` text(10) NOT NULL,
	`icon` text(10),
	`color` text(7),
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_categories`("id", "user_id", "name", "kind", "icon", "color", "created_at", "updated_at") SELECT "id", "user_id", "name", "kind", "icon", "color", "created_at", "updated_at" FROM `categories`;--> statement-breakpoint
DROP TABLE `categories`;--> statement-breakpoint
ALTER TABLE `__new_categories` RENAME TO `categories`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `categories_user_idx` ON `categories` (`user_id`);--> statement-breakpoint
CREATE INDEX `categories_kind_idx` ON `categories` (`user_id`,`kind`);--> statement-breakpoint
CREATE UNIQUE INDEX `categories_user_id_name_kind_unique` ON `categories` (`user_id`,`name`,`kind`);