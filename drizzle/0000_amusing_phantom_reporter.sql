CREATE TABLE `wiki_edits` (
	`slug` text PRIMARY KEY NOT NULL,
	`edit_json` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `wiki_revisions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`timestamp` text NOT NULL,
	`user_id` text NOT NULL,
	`user_name` text NOT NULL,
	`picture` text
);
