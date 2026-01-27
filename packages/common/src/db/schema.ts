import { bigint, integer, pgTable, text, boolean } from 'drizzle-orm/pg-core';

export const offerTable = pgTable('offers', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	// status
	status: text('status').notNull(),

	// fiat info
	fiatCurrency: text('fiat_currency').notNull(),
	fiatAmount: integer('fiat_amount').notNull(),
	fiatProviderId: integer("fiat_provider_id").references(() => fiatProviderTable.id),
	fiatAddress: text('fiat_address').notNull(),

	// conversion
	conversionRate: bigint({ mode: "number" }).notNull(),
	satsAmount: integer('sats_amount').notNull(),

	// markup (always in sats)
	platformFeeFlatRate: integer('platform_fee_flat_rate').notNull(),
	platformFeePercentage: integer('platform_fee_percentage').notNull(),
	takerFeeFlatRate: integer('taker_fee_flat_rate').notNull(),
	takerFeePercentage: integer('taker_fee_percentage').notNull(),
	takerBondFlatRate: integer('taker_bond_flat_rate').notNull(),
	makerBondFlatRate: integer('maker_bond_flat_rate').notNull(),
	makerBondPercentage: integer('maker_bond_percentage').notNull(),
	takerBondPercentage: integer('taker_bond_percentage').notNull(),

	// sessions
	makerSessionId: integer("maker_session_id").references(() => sessionTable.id).notNull().unique(),
	takerSessionId: integer("taker_session_id").references(() => sessionTable.id).notNull().unique(),

	makerBondAndEscrow: text("maker_bond_and_escrow"),
	takerBond: text("taker_bond"),

	// Timestamps
	updatedAt: integer('updated_at').notNull(),
	paidAt: integer('paid_at'),
	claimedAt: integer("claimed_at"),
	completedAt: integer("completed_at"),
	expiresAt: integer('expires_at'),


	receiptImg: text('receipt_img').notNull(),

	//dispute
	maker_feedback: text('maker_feedback'),
	taker_feedback: text('taker_feedback'),
	resolutionReason: text('resolution_reason'),
	description: text('description'),
	takerRewardToken: text('taker_reward'),
	makerRefundToken: text('maker_refund_token'),
});

export const sessionTable = pgTable("sessions", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	// Blind auth token
	bat: text("bat").unique().notNull(),
	expiresAt: integer("expires_at")
})

export const subscriptionTable = pgTable('subscriptions', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	createdAt: integer('created_at').notNull(),
	subscription: text('subscription').notNull().unique(),
	type: text('type')
})

export const adminTable = pgTable("admins", {
	id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	pubkey: text("pubkey").notNull(),
	role: text("role").notNull() // roles: admin, oidc-api
});

export const userTable = pgTable('users', {
	id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
	inviteCode: text("invite_code").notNull().unique(),
	codeExpiresAt: integer("code_expires_at"),
	createdAt: integer("created_at").notNull(),
	pubkey: text("pubkey").unique(),
	isActive: boolean("is_active")
})

export const fiatProviderTable = pgTable("fiat_providers", {
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

export type Offer = typeof offerTable.$inferSelect;
export type Session = typeof sessionTable.$inferSelect;
export type Subscription = typeof subscriptionTable.$inferSelect;
export type Admin = typeof adminTable.$inferSelect;
export type User = typeof userTable.$inferSelect;
export type FiatProvider = typeof fiatProviderTable.$inferSelect;
export type Setting = typeof settingsTable.$inferSelect;
export type VapidKey = typeof vapidKeysTable.$inferSelect;


export type InsertOffer = typeof offerTable.$inferInsert;
export type InsertSession = typeof sessionTable.$inferInsert;
export type InsertSubscription = typeof subscriptionTable.$inferInsert;
export type InsertAdmin = typeof adminTable.$inferInsert;
export type InsertUser = typeof userTable.$inferInsert;
export type InsertFiatProvider = typeof fiatProviderTable.$inferInsert;
export type InsertSetting = typeof settingsTable.$inferInsert;
export type InsertVapidKey = typeof vapidKeysTable.$inferInsert;
