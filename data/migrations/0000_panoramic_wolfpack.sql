CREATE TABLE "admins" (
	"id" text PRIMARY KEY NOT NULL,
	"pubkey" text NOT NULL,
	"role" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fiat_providers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "fiat_providers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"label" text NOT NULL,
	"icon" text NOT NULL,
	"match_template" text,
	"created_at" integer NOT NULL,
	CONSTRAINT "fiat_providers_label_unique" UNIQUE("label")
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "offers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"status" text NOT NULL,
	"fiat_currency" text NOT NULL,
	"fiat_amount" integer NOT NULL,
	"fiat_provider_id" integer,
	"fiat_address" text NOT NULL,
	"conversionRate" bigint NOT NULL,
	"sats_amount" integer NOT NULL,
	"platform_fee_flat_rate" integer NOT NULL,
	"platform_fee_percentage" integer NOT NULL,
	"taker_fee_flat_rate" integer NOT NULL,
	"taker_fee_percentage" integer NOT NULL,
	"taker_bond_flat_rate" integer NOT NULL,
	"maker_bond_flat_rate" integer NOT NULL,
	"maker_bond_percentage" integer NOT NULL,
	"taker_bond_percentage" integer NOT NULL,
	"maker_session_id" integer NOT NULL,
	"taker_session_id" integer NOT NULL,
	"maker_bond_and_escrow" text,
	"taker_bond" text,
	"updated_at" integer NOT NULL,
	"paid_at" integer,
	"claimed_at" integer,
	"completed_at" integer,
	"expires_at" integer,
	"receipt_img" text NOT NULL,
	"maker_feedback" text,
	"taker_feedback" text,
	"resolution_reason" text,
	"description" text,
	"taker_reward" text,
	"maker_refund_token" text,
	CONSTRAINT "offers_maker_session_id_unique" UNIQUE("maker_session_id"),
	CONSTRAINT "offers_taker_session_id_unique" UNIQUE("taker_session_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sessions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"bat" text NOT NULL,
	"expires_at" integer,
	CONSTRAINT "sessions_bat_unique" UNIQUE("bat")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "settings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"created_at" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "subscriptions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" integer NOT NULL,
	"subscription" text NOT NULL,
	"type" text,
	CONSTRAINT "subscriptions_subscription_unique" UNIQUE("subscription")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"invite_code" text NOT NULL,
	"code_expires_at" integer,
	"created_at" integer NOT NULL,
	"pubkey" text,
	"is_active" boolean,
	CONSTRAINT "users_invite_code_unique" UNIQUE("invite_code"),
	CONSTRAINT "users_pubkey_unique" UNIQUE("pubkey")
);
--> statement-breakpoint
CREATE TABLE "vapid_keys" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "vapid_keys_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"vapid_json" text NOT NULL,
	"created_at" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_fiat_provider_id_fiat_providers_id_fk" FOREIGN KEY ("fiat_provider_id") REFERENCES "public"."fiat_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_maker_session_id_sessions_id_fk" FOREIGN KEY ("maker_session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_taker_session_id_sessions_id_fk" FOREIGN KEY ("taker_session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;