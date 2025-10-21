import {
	CheckStateEnum,
	OutputData,
	type Proof,
	getEncodedToken,
} from "@cashu/cashu-ts";
import { db } from "@openPleb/common/db";
import {
	type InsertProof,
	type Offer,
	claimsTable,
	offerTable,
	proofsTable,
	receiptsTable,
} from "@openPleb/common/db/schema";
import { verifyPayload } from "@openPleb/common/payloads";
import { OFFER_STATE } from "@openPleb/common/types";
import { and, eq } from "drizzle-orm";
import { wallet } from "../../dynamic/wallet";
import { eventEmitter } from "../../events/emitter";
import { parseSecret } from "../../helper/cashu";
import { InternalProofState } from "../../types";
export const commitFeedback = async (
	offerId: string,
	feedbackData: {
		payload: {
			status: string;
			feedback: string;
		};
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

	if (![OFFER_STATE.RECEIPT_SUBMITTED].includes(offer.status)) {
		return new Response(`Invalid offer state: ${offer.status}`, {
			status: 400,
		});
	}

	const isValidSig = verifyPayload(
		feedbackData.payload,
		feedbackData.signature,
		feedbackData.nonce,
		feedbackData.timestamp,
		offer.pubkey,
	);

	if (!isValidSig) {
		return new Response("Invalid signature", { status: 401 });
	}
	if (
		![OFFER_STATE.MARKED_WITH_ISSUE, OFFER_STATE.COMPLETED].includes(
			feedbackData.payload.status,
		)
	) {
		return new Response("Invalid status", { status: 400 });
	}
	if (feedbackData.payload.status === OFFER_STATE.MARKED_WITH_ISSUE) {
		return await handleMarkedWithIssue(offerId, feedbackData.payload.feedback);
	}
	return await handlePayouts(offer, feedbackData.payload.status, {
		feedback: feedbackData.payload.feedback,
	});
};

const handleMarkedWithIssue = async (offerId: string, feedback: string) => {
	const id = Number.parseInt(offerId);
	const offers = await db
		.select()
		.from(offerTable)
		.where(eq(offerTable.id, id));

	if (!offers || offers.length === 0) {
		return new Response("Offer not found", { status: 404 });
	}

	const offer = offers[0];

	// Add 250 seconds to the expiry time
	const currentValidForS = offer.validForS || 0;
	const updatedValidForS = currentValidForS + 250;

	// Update offer status, feedback, and validity period
	const updatedOffer = await db
		.update(offerTable)
		.set({
			status: OFFER_STATE.MARKED_WITH_ISSUE,
			feedback,
			validForS: updatedValidForS,
		})
		.where(eq(offerTable.id, id))
		.returning();

	if (!updatedOffer || updatedOffer.length === 0) {
		return new Response("Failed to update offer", { status: 500 });
	}

	// Notify connected clients about the update
	eventEmitter.emit("socket-event", {
		command: "update-offer",
		data: { offer: updatedOffer[0] },
	});

	return updatedOffer[0];
};

export const handlePayouts = async (
	offer: Offer,
	status: string,
	custom?: {
		maker?: number;
		taker?: number;
		resolutionReason?: string;
		feedback?: string;
	},
) => {
	const receipts = await db
		.select()
		.from(receiptsTable)
		.where(eq(receiptsTable.offerId, offer.id));

	if (receipts.length === 0) {
		return new Response("No receipts found", { status: 404 });
	}
	const proofsFromDb = await db
		.select()
		.from(proofsTable)
		.where(
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

	const sendAmount =
		custom?.taker ??
		offer.satsAmount +
			offer.takerFeeFlatRate +
			offer.takerFeePercentage +
			offer.bondFlatRate +
			offer.bondPercentage;

	const makerBondAmount =
		custom?.maker ?? offer.bondFlatRate + offer.bondPercentage;

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

	const mintUrl = Bun.env.OPENPLEB_MINT_URL || "";

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
		.set({ reward: rewardToken })
		.where(eq(claimsTable.offerId, offer.id))
		.returning();

	if (updatedClaims.length === 0) {
		return new Response("Could not update receipt", { status: 400 });
	}

	const values: {
		status: string;
		refund?: string;
		feedback?: string;
		resolutionReason?: string;
	} = { status, refund: refundToken };

	if (custom?.feedback) {
		values.feedback = custom.feedback;
	}
	if (custom?.resolutionReason) {
		values.resolutionReason = custom.resolutionReason;
	}

	const updatedOffer = await db
		.update(offerTable)
		.set(values)
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
