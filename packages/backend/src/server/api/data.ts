import { db } from "@openPleb/common/db";
import {
	type Offer,
	claimsTable,
	offerTable,
	receiptsTable,
} from "@openPleb/common/db/schema";
import { OFFER_STATE } from "@openPleb/common/types";
import { eq, inArray, or } from "drizzle-orm";

export const getData = async (pubkey: string) => {
	const res = await db
		.select()
		.from(offerTable)
		.fullJoin(claimsTable, eq(claimsTable.offerId, offerTable.id))
		.where(
			or(
				eq(claimsTable.pubkey, pubkey),
				eq(offerTable.pubkey, pubkey),
				eq(offerTable.status, OFFER_STATE.INVOICE_PAID),
			),
		);
	const offers: Offer[] = res.flatMap((o) => o.offers ?? []);
	const offerIds = offers.map((o) => o.id);
	const claims = await db
		.select()
		.from(claimsTable)
		.where(inArray(claimsTable.offerId, offerIds));
	const receipts = await db
		.select()
		.from(receiptsTable)
		.where(inArray(receiptsTable.offerId, offerIds));
	return { offers, claims, receipts };
};

export const getDataForId = async (id: number) => {
	const offer = await db.select().from(offerTable).where(eq(offerTable.id, id));
	if (!offer.length)
		return { offer: undefined, claim: undefined, receipt: undefined };
	const claim = await db
		.select()
		.from(claimsTable)
		.where(eq(claimsTable.offerId, id));
	const receipt = await db
		.select()
		.from(receiptsTable)
		.where(eq(receiptsTable.offerId, id));
	return {
		offer: offer[0],
		claim: claim.length ? claim[0] : null,
		receipt: receipt.length ? receipt[0] : null,
	};
};
