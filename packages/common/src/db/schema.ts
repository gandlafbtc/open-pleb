import { integer, pgTable, text } from 'drizzle-orm/pg-core';

export const offerTable = pgTable('offers', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	createdAt: integer('created_at').notNull(),
	amount: integer('amount').notNull(),
	qrCode: text('qr_code').notNull(),
	invoice: text('invoice').notNull(),
	conversionRate: integer('conversion_rate').notNull(),
	platformFeeFlatRate: integer('platform_fee_flat_rate').notNull(),
	takerFeeFlatRate: integer('taker_fee_flat_rate').notNull(),
	takerFeePercentage: integer('taker_fee_percentage').notNull(),
	platformFeePercentage: integer('platform_fee_percentage').notNull(),
	satsAmount: integer('sats_amount').notNull(),
	status: text('status').notNull(),
	pubkey: text('pubkey').notNull(),
	paidAt: integer('paid_at'),
	validForS: integer('valid_for_s'),
	currency: text('currency'),
	feedback: text('feedback'),
	description: text('description')
});

export const mintQuotesTable = pgTable('mint_quotes', {
	quote: text('quote').notNull().primaryKey(),
	amount: integer('amount').notNull(),
	request: text('request').notNull(),
	state: text('state').notNull(),
	expiry: integer('expiry').notNull(),	
  	offerId: integer("offer_id").references(() => offerTable.id).notNull().unique()
});

export const claimsTable = pgTable('claims', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  createdAt: integer('created_at').notNull(),
  pubkey: text('pubkey').notNull(),
  offerId: integer("offer_id").references(() => offerTable.id).notNull().unique()
});

export const receiptsTable = pgTable('receipts', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
	createdAt: integer('created_at').notNull(),
	pubkey: text('pubkey').notNull(),
  receiptImg: text('receipt_img').notNull(),
  offerId: integer("offer_id").references(() => offerTable.id).notNull().unique(),
  reward: text('reward')
});

export type MintQuote = typeof mintQuotesTable.$inferSelect;
export type Claim = typeof claimsTable.$inferSelect;
export type Offer = typeof offerTable.$inferSelect;
export type Receipt = typeof receiptsTable.$inferSelect;

export type InsertMintQuote = typeof mintQuotesTable.$inferInsert;
export type InsertClaim = typeof claimsTable.$inferInsert;
export type InsertOffer = typeof offerTable.$inferInsert;
export type InsertReceipt = typeof receiptsTable.$inferInsert;
