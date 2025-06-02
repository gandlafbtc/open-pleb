import { integer, pgTable, text } from 'drizzle-orm/pg-core';

export const offerTable = pgTable('offers', {
	id: integer().primaryKey().$defaultFn(()=> Math.ceil(Math.random()*100000000)),
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
	feedbackResponse: text('feedback_response'),
	resolutionReason: text('resolution_reason'),
	description: text('description'),
	refund: text('refund'),
	fiatProviderId: integer("fiat_provider_id").references(() => fiatProviderTable.id)
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
  offerId: integer("offer_id").references(() => offerTable.id).notNull().unique(),
  reward: text('reward'),
});

export const receiptsTable = pgTable('receipts', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  createdAt: integer('created_at').notNull(),
  pubkey: text('pubkey').notNull(),
  receiptImg: text('receipt_img').notNull(),
  offerId: integer("offer_id").references(() => offerTable.id).notNull().unique(),
});

export const subscriptionsTable = pgTable('subscriptions', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	createdAt: integer('created_at').notNull(),
	subscription: text('subscription').notNull().unique(),
	type: text('type')
})

export const userTable = pgTable("user", {
	id: text("id").primaryKey().$defaultFn(()=> crypto.randomUUID()),
    username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	createdAt: integer('created_at').notNull(),
});

export const fiatProviderTable = pgTable("fiat_provider", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
    label: text('label').notNull().unique(),
	icon: text('icon').notNull(),
	matchTemplate: text('match_template'),
	createdAt: integer('created_at').notNull(),
});

export const settingsTable = pgTable("settings", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: text('user_id').notNull().references(() => userTable.id),
    key: text('key').notNull(),
	label: text('label').notNull(),
    value: text('value').notNull(),
	createdAt: integer('created_at').notNull(),
});

export const vapidKeysTable = pgTable("vapid_keys", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
    vapidJSON: text('vapid_json').notNull(),
	createdAt: integer('created_at').notNull(),
});

export type MintQuote = typeof mintQuotesTable.$inferSelect;
export type Claim = typeof claimsTable.$inferSelect;
export type Offer = typeof offerTable.$inferSelect;
export type Receipt = typeof receiptsTable.$inferSelect;
export type Proof = typeof proofsTable.$inferSelect;
export type Subscription = typeof subscriptionsTable.$inferSelect;
export type User = typeof userTable.$inferSelect;
export type FiatProvider = typeof fiatProviderTable.$inferSelect;
export type Setting = typeof settingsTable.$inferSelect;
export type VapidKey = typeof vapidKeysTable.$inferSelect;

export type InsertMintQuote = typeof mintQuotesTable.$inferInsert;
export type InsertClaim = typeof claimsTable.$inferInsert;
export type InsertOffer = typeof offerTable.$inferInsert;
export type InsertReceipt = typeof receiptsTable.$inferInsert;
export type InsertProof = typeof proofsTable.$inferInsert;
export type InsertSubscription = typeof subscriptionsTable.$inferInsert;
export type InsertUser = typeof userTable.$inferInsert;
export type InsertFiatProvider = typeof fiatProviderTable.$inferInsert;
export type InsertSetting = typeof settingsTable.$inferInsert;
export type InsertVapidKey = typeof vapidKeysTable.$inferInsert;