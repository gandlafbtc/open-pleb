CREATE TABLE "claims" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "claims_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" integer NOT NULL,
	"pubkey" text NOT NULL,
	"offer_id" integer NOT NULL,
	"reward" text,
	CONSTRAINT "claims_offer_id_unique" UNIQUE("offer_id")
);
--> statement-breakpoint
CREATE TABLE "fiat_provider" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "fiat_provider_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"label" text NOT NULL,
	"icon" text NOT NULL,
	"match_template" text,
	"created_at" integer NOT NULL,
	CONSTRAINT "fiat_provider_label_unique" UNIQUE("label")
);
--> statement-breakpoint
CREATE TABLE "mint_quotes" (
	"quote" text PRIMARY KEY NOT NULL,
	"amount" integer NOT NULL,
	"request" text NOT NULL,
	"state" text NOT NULL,
	"expiry" integer NOT NULL,
	"offer_id" integer NOT NULL,
	CONSTRAINT "mint_quotes_offer_id_unique" UNIQUE("offer_id")
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" integer PRIMARY KEY NOT NULL,
	"created_at" integer NOT NULL,
	"amount" integer NOT NULL,
	"qr_code" text NOT NULL,
	"conversionRate" bigint NOT NULL,
	"platform_fee_flat_rate" integer NOT NULL,
	"taker_fee_flat_rate" integer NOT NULL,
	"taker_fee_percentage" integer NOT NULL,
	"platform_fee_percentage" integer NOT NULL,
	"bond_flat_rate" integer NOT NULL,
	"bond_percentage" integer NOT NULL,
	"sats_amount" integer NOT NULL,
	"status" text NOT NULL,
	"pubkey" text NOT NULL,
	"invoice" text,
	"paid_at" integer,
	"valid_for_s" integer,
	"currency" text,
	"feedback" text,
	"feedback_response" text,
	"resolution_reason" text,
	"description" text,
	"refund" text,
	"fiat_provider_id" integer
);
--> statement-breakpoint
CREATE TABLE "offer_tokens" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "offer_tokens_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"offer_id" integer NOT NULL,
	"receive_maker_bond_token" text,
	"receive_taker_bond_token" text,
	"receive_payment_token" text,
	"send_maker_bond_token" text,
	"send_taker_bond_token" text,
	"send_payment_token" text,
	CONSTRAINT "offer_tokens_offer_id_unique" UNIQUE("offer_id")
);
--> statement-breakpoint
CREATE TABLE "proofs" (
	"identifier" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "proofs_identifier_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"id" text NOT NULL,
	"secret" text NOT NULL,
	"c" text NOT NULL,
	"amount" integer NOT NULL,
	"offer_id" integer NOT NULL,
	"state" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "receipts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "receipts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" integer NOT NULL,
	"pubkey" text NOT NULL,
	"receipt_img" text NOT NULL,
	"offer_id" integer NOT NULL,
	CONSTRAINT "receipts_offer_id_unique" UNIQUE("offer_id")
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
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" integer NOT NULL,
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "vapid_keys" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "vapid_keys_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"vapid_json" text NOT NULL,
	"created_at" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mint_quotes" ADD CONSTRAINT "mint_quotes_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_fiat_provider_id_fiat_provider_id_fk" FOREIGN KEY ("fiat_provider_id") REFERENCES "public"."fiat_provider"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_tokens" ADD CONSTRAINT "offer_tokens_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proofs" ADD CONSTRAINT "proofs_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;