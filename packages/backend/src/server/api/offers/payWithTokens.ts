import { getDecodedToken } from "@cashu/cashu-ts";
import { db } from "@openPleb/common/db";
import {
	type InsertProof,
	offerTable,
	proofsTable,
} from "@openPleb/common/db/schema";
import { ensureError } from "@openPleb/common/errors";
import { OFFER_STATE } from "@openPleb/common/types";
import { eq } from "drizzle-orm";
import { wallet } from "../../../cashu/wallet";
import { notifyNewOfferSubs } from "../../../dynamic/subscribers";
import { eventEmitter } from "../../../events/emitter";
import { InternalProofState } from "../../../types";

export const payWithTokens = async (id: string, tokenString: string) => {
	if (!id) {
		return new Response("Invalid request", { status: 400 });
	}
	const offerId = Number.parseInt(id);
	if (Number.isNaN(offerId)) {
		return new Response("Invalid offer ID", { status: 400 });
	}

	const offer = await db.query.offerTable.findFirst({
		where: (offer, { eq }) => eq(offer.id, offerId),
	});

	if (!offer) {
		return new Response("Offer not found", { status: 404 });
	}

	if (offer.status !== OFFER_STATE.CREATED) {
		return new Response("Invalid offer state", { status: 400 });
	}

	const totalAmount =
		offer.satsAmount +
		offer.platformFeePercentage +
		offer.takerFeePercentage +
		offer.platformFeeFlatRate +
		offer.takerFeeFlatRate +
		offer.bondPercentage +
		offer.bondFlatRate;

	const token = getDecodedToken(tokenString);

	const tokenAmount = token.proofs.reduce(
		(acc, proof) => acc + proof.amount,
		0,
	);

	if (totalAmount !== tokenAmount) {
		return new Response("bond amount mismatch", { status: 400 });
	}

	try {
		const proofs = await wallet.receive(token);
		if (proofs.reduce((acc, proof) => acc + proof.amount, 0) !== totalAmount) {
			throw new Error("Invalid bond amount after redemption");
		}
		const proofsToInsert: InsertProof[] = proofs.map((p) => {
			return {
				id: p.id,
				C: p.C,
				amount: p.amount,
				secret: p.secret,
				offerId,
				state: InternalProofState.UNSPENT,
			};
		});
		await db.insert(proofsTable).values(proofsToInsert);
	} catch (error) {
		await db;
		const err = ensureError(error);
		return new Response(`Error redeeming bond: ${err.message}`, {
			status: 400,
		});
	}

	const offerResponse = await db
		.update(offerTable)
		.set({ status: "INVOICE_PAID", validForS: 300 })
		.where(eq(offerTable.id, offerId))
		.returning();

	const o = offerResponse[0];
	eventEmitter.emit("socket-event", {
		command: "update-offer",
		data: { offer: o },
	});

	notifyNewOfferSubs(o);

	return { offer: offerResponse[0] };
};
