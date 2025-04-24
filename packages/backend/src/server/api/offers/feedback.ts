import {
	CheckStateEnum,
	getEncodedToken,
	OutputData,
	type Proof,
} from "@cashu/cashu-ts";
import { schnorr } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha256";
import { db } from "@openPleb/common/db";
import {
	claimsTable,
	type InsertProof,
	offerTable,
	proofsTable,
	receiptsTable,
	type Offer,
	type Receipt,
} from "@openPleb/common/db/schema";
import { OFFER_STATE } from "@openPleb/common/types";
import { and, eq } from "drizzle-orm";
import { wallet } from "../../../cashu/wallet";
import { eventEmitter } from "../../../events/emitter";
import { parseSecret } from "../../../cashu/helper";
import { InternalProofState } from "../../../types";
export const commitFeedback = async (
	offerId: string,
	feedbackData: {
		feedback: string;
		signature: string;
		status: string;
		nonce: string;
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

	if (
		![
			OFFER_STATE.RECEIPT_SUBMITTED,
		].includes(offer.status)
	) {
		return new Response(`Invalid offer state: ${offer.status}`, {
			status: 400,
		});
	}

	const message = feedbackData.nonce +
		feedbackData.feedback +
		feedbackData.status +
		offerId +
		offer.invoice;
	const messageHash = sha256(message);
	const res = schnorr.verify(
		feedbackData.signature,
		messageHash,
		offer.pubkey,
	);
	if (!res) {
		return new Response("Invalid signature", { status: 401 });
	}
	if (
		![
			OFFER_STATE.MARKED_WITH_ISSUE,
			OFFER_STATE.COMPLETED,
		].includes(feedbackData.status)
	) {
		return new Response("Invalid status", { status: 400 });
	}

	return await handlePayouts(offer, feedbackData.feedback, feedbackData.status);
};

export const handlePayouts = async (
	offer: Offer,
	feedback: string,
	status: string,
) => {
		const receipts = await db
		.select()
		.from(receiptsTable)
		.where(eq(receiptsTable.offerId, offer.id));

	if (receipts.length === 0) {
		return new Response("No receipts found", { status: 404 });
	}
	const proofsFromDb = await db.select().from(proofsTable).where(
		and(
			eq(proofsTable.state, CheckStateEnum.UNSPENT),
			eq(proofsTable.offerId, offer.id),
		),
	);

	const proofs: Proof[] = proofsFromDb.map((p) => {
		return {
			secret: p.secret,
			amount: p.amount,
			id: p.id,
			C: p.C,
		};
	});

	const sendAmount = offer.satsAmount + offer.takerFeeFlatRate +
		offer.takerFeePercentage + offer.bondFlatRate +
		offer.bondPercentage;

	const makerBondAmount = offer.bondFlatRate + offer.bondPercentage;

	const keys = await wallet.getKeys();

	const makerPub = `02${offer.pubkey}`;
	const takerPub = `02${receipts[0].pubkey}`;
	const makerBondAmountOutputData = OutputData.createP2PKData(
		{
			pubkey: makerPub,
			//todo add refund
		},
		makerBondAmount,
		keys,
	);

	const sendAmountOutputData = OutputData.createP2PKData(
		{
			pubkey: takerPub,
		},
		sendAmount,
		keys,
	);

	const { keep, send } = await wallet.send(
		makerBondAmount + sendAmount,
		proofs,
		{
			outputData: {
				send: [...makerBondAmountOutputData, ...sendAmountOutputData],
			},
		},
	);

	const proofsToInsert: InsertProof[] = [...keep, ...send].map((p) => {
		return {
			id: p.id,
			C: p.C,
			amount: p.amount,
			secret: p.secret,
			offerId: offer.id,
			state: InternalProofState.PENDING,
		};
	});

	await db.insert(proofsTable).values(proofsToInsert);

	const rewardProofs = send.filter((p) => {
		//check secrets for lock
		try {
			const secret = parseSecret(p.secret);
			if (secret[0] === "P2PK" && secret[1].data === takerPub) {
				return true;
			}
			return false;
		} catch {
			return false;
		}
	});

	const refundProofs = send.filter((p) => {
		//check secrets for lock
		try {
			const secret = parseSecret(p.secret);
			if (secret[0] === "P2PK" && secret[1].data === makerPub) {
				return true;
			}
			return false;
		} catch {
			return false;
		}
	});

	const mintUrl = Bun.env.PUBLIC_MINT_URL || '';
	
	const refundToken = getEncodedToken({
		mint: mintUrl,
		proofs: refundProofs,
	});

	const rewardToken = getEncodedToken({
		mint: mintUrl,
		proofs: rewardProofs,
	});

	const updatedClaims = await db
		.update(claimsTable)
		.set({ reward: rewardToken }).where(eq(claimsTable.offerId, offer.id))
		.returning();

	if (updatedClaims.length === 0) {
		return new Response("Could not update receipt", { status: 400 });
	}

	const updatedOffer = await db
	.update(offerTable)
	.set({ feedback, status, refund: refundToken  })
	.where(eq(offerTable.id, offer.id))
	.returning();

	if (!updatedOffer || updatedOffer.length === 0) {
		return new Response("Failed to update offer", { status: 500 });
	}
	eventEmitter.emit("socket-event", {
		command: "update-offer",
		data: { offer: updatedOffer[0] },
	});


	const claim = updatedClaims[0];

	eventEmitter.emit("socket-event", {
		command: "update-claim",
		data: { claim },
		pubkeys: [claim.pubkey, offer.pubkey],
	});
	return updatedOffer[0];
};
