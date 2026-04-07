import { db } from "../../db/db";
import { offerTable } from "common/db/schema";
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
