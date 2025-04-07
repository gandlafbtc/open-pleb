CREATE TABLE "claims" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "claims_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" integer NOT NULL,
	"pubkey" text NOT NULL,
	"offer_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mint_quotes" (
	"quote" text PRIMARY KEY NOT NULL,
	"request" text NOT NULL,
	"state" text NOT NULL,
	"expiry" integer NOT NULL,
	"offer_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "offers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" integer NOT NULL,
	"amount" integer NOT NULL,
	"qr_code" text NOT NULL,
	"invoice" text NOT NULL,
	"conversion_rate" integer NOT NULL,
	"platform_fee_flat_rate" integer NOT NULL,
	"taker_fee_flat_rate" integer NOT NULL,
	"taker_fee_percentage" integer NOT NULL,
	"platform_fee_percentage" integer NOT NULL,
	"sats_amount" integer NOT NULL,
	"status" text NOT NULL,
	"pubkey" text NOT NULL,
	"paid_at" integer,
	"valid_for_s" integer,
	"currency" text,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "receipts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "receipts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" integer NOT NULL,
	"pubkey" text NOT NULL,
	"receipt_img" text NOT NULL,
	"offer_id" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mint_quotes" ADD CONSTRAINT "mint_quotes_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE no action ON UPDATE no action;