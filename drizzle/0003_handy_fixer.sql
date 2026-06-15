CREATE TABLE `review_helpful_votes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`review_id` int NOT NULL,
	`user_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `review_helpful_votes_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_review_user` UNIQUE(`review_id`,`user_id`)
);
