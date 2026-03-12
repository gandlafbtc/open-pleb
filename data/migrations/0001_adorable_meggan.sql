DROP TABLE "offer_tokens" CASCADE;--> statement-breakpoint
ALTER TABLE "offers" ADD COLUMN "receipt_skipped" boolean DEFAULT false NOT NULL;