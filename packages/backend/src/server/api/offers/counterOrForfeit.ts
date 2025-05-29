import { db } from "@openPleb/common/db";
import {
	claimsTable,
	offerTable,
	type Offer,
} from "@openPleb/common/db/schema";
import { verifyPayload } from "@openPleb/common/payloads";
import { DISPUTE_RESPONSE, OFFER_STATE } from "@openPleb/common/types";
import { eq } from "drizzle-orm";
import { eventEmitter } from "../../../events/emitter";

export const counterOrForfeitDispute = async (
	offerId: string,
	data: {
		payload: {
			response: string; 
			message: string; 
		}
		signature: string;
		nonce: string;
		timestamp: number; 
	},
) => {
	const id = Number.parseInt(offerId);
	const offers = await db
		.select()
		.from(offerTable)
		.where(eq(offerTable.id, id));

	if (!offers || offers.length === 0) {
		return new Response("Offer not found", { status: 404 });
	}
	const offer = offers[0];

	if (![OFFER_STATE.MARKED_WITH_ISSUE].includes(offer.status)) {
		return new Response(`Invalid offer state: ${offer.status}`, {
			status: 400,
		});
	}

    const claims = await db.select().from(claimsTable).where(eq(claimsTable.offerId, id))

	if (!claims || claims.length === 0) {
		return new Response("Claim not found", { status: 404 });
	}
    const claim = claims[0];

	const res = verifyPayload(data.payload, data.signature, data.nonce, data.timestamp, claim.pubkey)
    if (!res) {
		return new Response("Invalid signature", { status: 400 });
    }
    return await handleCounterOrForfeitDispute(id, data.payload);
};

const handleCounterOrForfeitDispute = async (id: number, payload: {response: string, message:string}) => {
	let values = {}
	if (payload.response === DISPUTE_RESPONSE.COUNTER) {
		values = {
			status: OFFER_STATE.DISPUTED,
			feedbackResponse: payload.message,
		}
	}
	else if (payload.response === DISPUTE_RESPONSE.FORFEIT) {
		values = {
			status: OFFER_STATE.FOREFEIT,
			feedbackResponse: payload.message,
			validForS: 0
	}
	} else {
		return new Response("Invalid dispute response", { status: 400 });
	}
    const [offer] = await db.update(offerTable).set(values).where(eq(offerTable.id, id)).returning();
	eventEmitter.emit("socket-event", {
		command: "update-offer",
		data: { offer },
	});
	return offer
};
