DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `brew_entries` MODIFY COLUMN `user_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `review_helpful_votes` MODIFY COLUMN `user_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `roaster_reviews` MODIFY COLUMN `user_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `user_profiles` MODIFY COLUMN `user_id` varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `role` enum('user','admin') DEFAULT 'user' NOT NULL;