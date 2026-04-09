import { db } from "../../db/db";
import { offerTable, type InsertOffer } from "common/db/schema";
import { eq } from "drizzle-orm";

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
