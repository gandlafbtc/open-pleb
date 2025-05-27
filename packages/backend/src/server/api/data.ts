import { db } from "@openPleb/common/db";
import {
	claimsTable,
	type Offer,
	offerTable,
	receiptsTable,
} from "@openPleb/common/db/schema";
import { OFFER_STATE, type UserInfo } from "@openPleb/common/types";
import { count, eq, inArray, or } from "drizzle-orm";

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
	const [offer] = await db.select().from(offerTable).where(
		eq(offerTable.id, id),
	);
	if (!offer) {
		return { offer: undefined, claim: undefined, receipt: undefined };
	}
	const [claim] = await db
		.select()
		.from(claimsTable)
		.where(eq(claimsTable.offerId, id));
	const [receipt] = await db
		.select()
		.from(receiptsTable)
		.where(eq(receiptsTable.offerId, id));

	const [makerOfferCount] = await db.select({ count: count() }).from(
		offerTable,
	).where(eq(offerTable.pubkey, offer.pubkey));
	const [makerClaimsCount] = await db.select({ count: count() }).from(
		claimsTable,
	).where(eq(claimsTable.pubkey, offer.pubkey));

	const makerInfo: UserInfo = {
		pubkey: offer.pubkey,
		numberOfOffers: makerOfferCount.count,
		numberOfClaims: makerClaimsCount.count,
		reviewsGiven: 0,
		reviewsReceived: 0,
		reviewScore: 0,
	};
	let takerInfo: UserInfo | undefined = undefined;
	if (claim) {
		const [takerOffersCount] = await db.select({ count: count() }).from(
			offerTable,
		).where(eq(offerTable.pubkey, claim.pubkey));
		const [takerClaimsCount] = await db.select({ count: count() }).from(
			claimsTable,
		).where(eq(claimsTable.pubkey, claim.pubkey));

		takerInfo = {
			pubkey: claim.pubkey,
			numberOfOffers: takerOffersCount.count,
			numberOfClaims: takerClaimsCount.count,
			reviewsGiven: 0,
			reviewsReceived: 0,
			reviewScore: 0,
		};
	}

	return {
		offer: offer,
		claim: claim,
		receipt: receipt,
		makerInfo,
		takerInfo,
	};
};
