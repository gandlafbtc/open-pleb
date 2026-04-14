import { db } from "../../db/db";
import { offerTable, type InsertOffer } from "common/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { OFFER_STATE } from "common/types";

/**
 * Get an offer by ID
 */
export async function getOfferById(offerId: number) {
	const [offer] = await db
		.select()
		.from(offerTable)
		.where(eq(offerTable.id, offerId))
		.limit(1);
	
	return offer;
}

/**
 * Get an offer by maker session ID
 */
export async function getOfferBySessionId(sessionId: string) {
	const [offer] = await db
		.select()
		.from(offerTable)
		.where(eq(offerTable.makerSessionId, sessionId))
		.limit(1);
	
	return offer;
}

/**
 * Create a new offer
 */
export async function createOffer(offerData: InsertOffer) {
	const [offer] = await db
		.insert(offerTable)
		.values(offerData)
		.returning();
	return offer;
}

/**
 * Update offer payment details (when maker pays bond + escrow)
 */
export async function updateOfferPayment(
	offerId: number,
	makerBondAndEscrow: string,
	status: string,
	paidAt: number,
) {
	const [offer] = await db
		.update(offerTable)
		.set({
			makerBondAndEscrow,
			status,
			paidAt,
		})
		.where(eq(offerTable.id, offerId))
		.returning();
	
	return offer;
}

/**
 * Get all listed offers (INVOICE_PAID status and not expired)
 */
export async function getListedOffers() {
	const now = Math.floor(Date.now() / 1000); // Convert to seconds
	
	const offers = await db
		.select()
		.from(offerTable)
		.where(
			and(
				eq(offerTable.status, OFFER_STATE.INVOICE_PAID),
				gt(offerTable.expiresAt, now)
			)
		);
	
	return offers;
}
