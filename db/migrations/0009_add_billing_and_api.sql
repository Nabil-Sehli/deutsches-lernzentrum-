-- Add billing fields to centers table
ALTER TABLE `centers` ADD COLUMN `stripeCustomerId` varchar(255);--> statement-breakpoint
ALTER TABLE `centers` ADD COLUMN `stripeSubscriptionId` varchar(255);--> statement-breakpoint
ALTER TABLE `centers` ADD COLUMN `nextBillingDate` timestamp;--> statement-breakpoint
ALTER TABLE `centers` ADD COLUMN `billingEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `centers` ADD COLUMN `planStartDate` timestamp;--> statement-breakpoint
CREATE INDEX `centers_stripeCustomerId_idx` ON `centers` (`stripeCustomerId`);--> statement-breakpoint

-- Create api_keys table
CREATE TABLE `api_keys` (
  `id` serial PRIMARY KEY,
  `centerId` bigint unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `key` varchar(255) NOT NULL UNIQUE,
  `lastUsedAt` timestamp,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `api_keys_centerId_idx` (`centerId`)
);--> statement-breakpoint

-- Create webhooks table
CREATE TABLE `webhooks` (
  `id` serial PRIMARY KEY,
  `centerId` bigint unsigned NOT NULL,
  `url` varchar(512) NOT NULL,
  `events` json NOT NULL,
  `active` boolean NOT NULL DEFAULT true,
  `lastTriggeredAt` timestamp,
  `lastFailureAt` timestamp,
  `failureCount` int NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `webhooks_centerId_idx` (`centerId`)
);--> statement-breakpoint

-- Create webhook_logs table
CREATE TABLE `webhook_logs` (
  `id` serial PRIMARY KEY,
  `webhookId` bigint unsigned NOT NULL,
  `eventType` varchar(100) NOT NULL,
  `statusCode` int,
  `response` text,
  `error` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `webhook_logs_webhookId_idx` (`webhookId`),
  INDEX `webhook_logs_eventType_idx` (`eventType`)
);
