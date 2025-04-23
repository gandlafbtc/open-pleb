import { integer, pgTable, text } from 'drizzle-orm/pg-core';

export const offerTable = pgTable('offers', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	createdAt: integer('created_at').notNull(),
	amount: integer('amount').notNull(),
	qrCode: text('qr_code').notNull(),
	conversionRate: integer('conversion_rate').notNull(),
	platformFeeFlatRate: integer('platform_fee_flat_rate').notNull(),
	takerFeeFlatRate: integer('taker_fee_flat_rate').notNull(),
	takerFeePercentage: integer('taker_fee_percentage').notNull(),
	platformFeePercentage: integer('platform_fee_percentage').notNull(),
	bondFlatRate: integer('bond_flat_rate').notNull(),
	bondPercentage: integer('bond_percentage').notNull(),
	satsAmount: integer('sats_amount').notNull(),
	status: text('status').notNull(),
	pubkey: text('pubkey').notNull(),
	invoice: text('invoice'),
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

export const proofsTable = pgTable('proofs', {
	identifier: integer().primaryKey().generatedAlwaysAsIdentity(),
	id: text('id').notNull(),
	secret: text('secret').notNull(),
	C: text('c').notNull(),
	amount: integer('amount').notNull(),
	offerId: integer("offer_id").references(() => offerTable.id).notNull(),
	state: text('state').notNull(),
});

export const offerTokensTable = pgTable('offer_tokens', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	offerId: integer("offer_id").references(() => offerTable.id).notNull().unique(),
	receiveMakerBondToken: text('receive_maker_bond_token'),
	receiveTakerBondToken: text('receive_taker_bond_token'),
	receivePaymentToken: text('receive_payment_token'),
	sendMakerBondToken: text('send_maker_bond_token'),
	sendTakerBondToken: text('send_taker_bond_token'),
	sendPaymentToken: text('send_payment_token'),
	platformFeeToken: text('send_payment_token'),
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
  reward: text('reward'),
  refund: text('refund')
});

export type MintQuote = typeof mintQuotesTable.$inferSelect;
export type Claim = typeof claimsTable.$inferSelect;
export type Offer = typeof offerTable.$inferSelect;
export type Receipt = typeof receiptsTable.$inferSelect;
export type Proof = typeof proofsTable.$inferSelect;

export type InsertMintQuote = typeof mintQuotesTable.$inferInsert;
export type InsertClaim = typeof claimsTable.$inferInsert;
export type InsertOffer = typeof offerTable.$inferInsert;
export type InsertReceipt = typeof receiptsTable.$inferInsert;
export type InsertProof = typeof proofsTable.$inferInsert;