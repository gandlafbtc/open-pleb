ALTER TABLE "sessions" DROP CONSTRAINT "sessions_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "is_maker" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" DROP COLUMN "user_id";