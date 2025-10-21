import { getDecodedToken } from "@cashu/cashu-ts";
import { db } from "@openPleb/common/db";
import {
	type Claim,
	type InsertProof,
	claimsTable,
	offerTable,
	proofsTable,
} from "@openPleb/common/db/schema";
import { ensureError } from "@openPleb/common/errors";
import { OFFER_STATE } from "@openPleb/common/types";
import { eq } from "drizzle-orm";
import { wallet } from "../../dynamic/wallet";
import { eventEmitter } from "../../events/emitter";
import { InternalProofState } from "../../types";

export const claimOffer = async (
	offerId: string,
	pubkey: string,
	bond: string,
) => {
	if (!pubkey || !offerId) {
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
			.set({ status: "CLAIMED", validForS: 300 })
			.where(eq(offerTable.id, id))
			.returning();

		const bondAmount = offer.bondFlatRate + offer.bondPercentage;

		const token = getDecodedToken(bond);

		const tokenAmount = token.proofs.reduce(
			(acc, proof) => acc + proof.amount,
			0,
		);

		if (bondAmount !== tokenAmount) {
			await db
				.update(offerTable)
				.set({ status: "INVOICE_PAID", validForS: 300 })
				.where(eq(offerTable.id, id))
				.returning();
			return new Response("bond amount mismatch", { status: 400 });
		}

		try {
			const proofs = await wallet.receive(bond);
			if (proofs.reduce((acc, proof) => acc + proof.amount, 0) !== bondAmount) {
				throw new Error("Invalid bond amount after redemption");
			}
			const proofsToInsert: InsertProof[] = proofs.map((p) => {
				return {
					id: p.id,
					C: p.C,
					amount: p.amount,
					secret: p.secret,
					offerId: id,
					state: InternalProofState.UNSPENT,
				};
			});
			await db.insert(proofsTable).values(proofsToInsert);
		} catch (error) {
			await db
				.update(offerTable)
				.set({ status: "INVOICE_PAID", validForS: 300 })
				.where(eq(offerTable.id, id))
				.returning();
			const err = ensureError(error);
			return new Response(`Error redeeming bond: ${err.message}`, {
				status: 400,
			});
		}

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
			pubkeys: [pubkey],
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
