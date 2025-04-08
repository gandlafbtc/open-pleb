import { getEncodedToken } from "@cashu/cashu-ts";
import { schnorr } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha256";
import { db } from "@openPleb/common/db";
import {
	mintQuotesTable,
	offerTable,
	receiptsTable,
} from "@openPleb/common/db/schema";
import { OFFER_STATE } from "@openPleb/common/types";
import { eq } from "drizzle-orm";
import { wallet } from "../../../cashu/wallet";
import { eventEmitter } from "../../../events/emitter";
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
	const message =
		feedbackData.nonce +
		feedbackData.feedback +
		feedbackData.status +
		offerId +
		offer.invoice;
	const messageHash = sha256(message);
	const res = schnorr.verify(feedbackData.signature, messageHash, offer.pubkey);
	if (!res) {
		return new Response("Invalid signature", { status: 401 });
	}
	if (![OFFER_STATE.MARKED_WITH_ISSUE, OFFER_STATE.COMPLETED, OFFER_STATE.MARKED_UNRESPONSIVE].includes(feedbackData.status)) {
		return new Response("Invalid status", { status: 400 });
	}
	const updatedOffer = await db
		.update(offerTable)
		.set({ feedback: feedbackData.feedback, status: feedbackData.status })
		.returning();

	if (!updatedOffer || updatedOffer.length === 0) {
		return new Response("Failed to update offer", { status: 500 });
	}
	eventEmitter.emit("socket-event", {
		command: "update-offer",
		data: { offer: updatedOffer[0] },
	});

	if (updatedOffer[0].status === OFFER_STATE.COMPLETED) {
		const mintQuotes = await db
			.select()
			.from(mintQuotesTable)
			.where(eq(mintQuotesTable.offerId, offer.id));
		const receipts = await db
			.select()
			.from(receiptsTable)
			.where(eq(receiptsTable.offerId, offer.id));

		if (mintQuotes.length === 0) {
			return new Response("No mint quotes found", { status: 404 });
		}

		if (receipts.length === 0) {
			return new Response("No receipts found", { status: 404 });
		}

		// const sendAmount = offer.satsAmount + offer.takerFeeFlatRate + offer.takerFeePercentage
		// const keepAmount = offer.platformFeeFlatRate + offer.platformFeePercentage

		// const keys = await wallet.getKeys()
		// const availableAmountsStrings = Object.keys(keys.keys)
		// const availableAmounts = availableAmountsStrings.map(Number).sort((a, b) => b-a);

		// const sendAmounts: number[] = []
		// const keepAmounts: number[] = []

		// let i = 0;

		// while (sendAmount > sendAmounts.reduce((acc, curr) => acc + curr, 0)) {
		//     const diff = sendAmount - sendAmounts.reduce((acc, curr) => acc + curr, 0)
		//     if (availableAmounts[i]<=diff) {
		//         sendAmounts.push(availableAmounts[i])
		//     }
		//     i++
		// }

		// while (keepAmount > keepAmounts.reduce((acc, curr) => acc + curr, 0)) {
		//     const diff = keepAmount - keepAmounts.reduce((acc, curr) => acc + curr, 0)
		//     if (availableAmounts[i]<=diff) {
		//         keepAmounts.push(availableAmounts[i])
		//         i++
		//     }
		// }

		const proofs = await wallet.mintProofs(
			mintQuotes[0].amount,
			mintQuotes[0].quote,
			{
				pubkey: receipts[0].pubkey,
				// outputAmounts: {
				//     sendAmounts,
				//     keepAmounts
				// }
			},
		);
		const token = getEncodedToken({ mint: Bun.env.PUBLIC_MINT_URL!, proofs });
		const updatedReceipts = await db
			.update(receiptsTable)
			.set({ reward: token })
			.returning();

		if (updatedReceipts.length === 0) {
			return new Response("Could not update receipt", { status: 400 });
		}

		eventEmitter.emit("socket-event", {
			command: "update-receipt",
			data: { receipt: updatedReceipts[0] },
		});
	}
	return updatedOffer[0];
};
