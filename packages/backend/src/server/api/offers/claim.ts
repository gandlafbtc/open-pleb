import { db } from "@openPleb/common/db";
import {
	type Claim,
	claimsTable,
	offerTable,
} from "@openPleb/common/db/schema";
import { OFFER_STATE } from "@openPleb/common/types";
import { eq } from "drizzle-orm";
import { eventEmitter } from "../../../events/emitter";

export const claimOffer = async (offerId: string, pubkey: string) => {
	if (!pubkey) {
		return new Response("Invalid request", { status: 400 });
	}

	if (!offerId) {
		return new Response("Invalid request", { status: 400 });
	}
	const id = Number.parseInt(offerId);
	if (Number.isNaN(id)) {
		return new Response("Invalid offer ID", { status: 400 });
	}

	const offer = await db.query.offerTable.findFirst({
		where: (offer, { eq }) => eq(offer.id, id),
	});

	if (!offer) {
		return new Response("Offer not found", { status: 404 });
	}
	if (offer.status === OFFER_STATE.INVOICE_PAID) {
		const offerResponse = await db
			.update(offerTable)
			.set({ status: "CLAIMED" })
			.where(eq(offerTable.id, id))
			.returning();
		const claim = await db
			.insert(claimsTable)
			.values({
				createdAt: Math.ceil(Date.now() / 1000),
				pubkey,
				offerId: offer.id,
			})
			.returning();
		eventEmitter.emit("socket-event", {
			command: "update-offer",
			data: { offer: offerResponse[0] },
		});
		eventEmitter.emit("socket-event", {
			command: "new-claim",
			data: { claim: claim[0] },
		});
		return { claim: claim[0] };
	}
	if (offer.status === OFFER_STATE.CLAIMED) {
		const claims = await db
			.select()
			.from(claimsTable)
			.where(eq(claimsTable.offerId, id));
		let claim: Claim;
		if (claims.length > 0) {
			claim = claims[0];
		} else {
			return new Response("Offer already claimed", { status: 400 });
		}
		if (claim.pubkey !== pubkey) {
			return new Response("Invalid claim", { status: 400 });
		}
		return { claim };
	}
	return new Response("Offer already claimed", { status: 400 });
};
