import { CashuMint } from "@cashu/cashu-ts";
import { db } from "@openPleb/common/db";
import {
	type InsertOffer,
	type Offer,
	mintQuotesTable,
	offerTable,
} from "@openPleb/common/db/schema";
import { OFFER_STATE } from "@openPleb/common/types";
import { eventEmitter } from "../events/emitter";

export interface OfferData {
	amount: number;
	conversionRate: number;
	qrCode: string;
	pubkey: string;
}

export const createOffer = async (offerData: OfferData): Promise<Offer> => {
	const { amount, conversionRate, qrCode, pubkey } = offerData;
	const satsAmount = Math.ceil((100000000 / conversionRate) * amount);

	const platformFeePercentage = Math.ceil(
		(satsAmount * Number.parseFloat(Bun.env.PUBLIC_PLATFORM_FEE_PERCENTAGE!)) /
			100,
	);

	const platformFeeFlatRate = Number.parseFloat(
		Bun.env.PUBLIC_PLATFORM_FEE_FLAT_RATE!,
	);
	const takerFeeFlatRate = Number.parseFloat(
		Bun.env.PUBLIC_TAKER_FEE_FLAT_RATE!,
	);

	const takerFeePercentage = Math.ceil(
		(satsAmount * Number.parseFloat(Bun.env.PUBLIC_TAKER_FEE_PERCENTAGE!)) /
			100,
	);

	const totalAmount =
		satsAmount +
		platformFeePercentage +
		takerFeePercentage +
		platformFeeFlatRate +
		takerFeeFlatRate;

	const cashuMint = new CashuMint(Bun.env.PUBLIC_MINT_URL!);

	const res = await cashuMint.createMintQuote({
		amount: totalAmount,
		unit: "sats",
	});

	const insertOffer: InsertOffer = {
		createdAt: Math.ceil(Date.now() / 1000),
		conversionRate,
		platformFeeFlatRate,
		takerFeeFlatRate: Number.parseInt(Bun.env.PUBLIC_TAKER_FEE_FLAT_RATE!),
		currency: "KRW",
		platformFeePercentage,
		takerFeePercentage,
		satsAmount,
		status: OFFER_STATE.CREATED,
		amount,
		qrCode,
		invoice: res.request,
		pubkey,
	};

	const offerResponse = await db
		.insert(offerTable)
		.values(insertOffer)
		.returning();

	await db.insert(mintQuotesTable).values({
		...res,
		amount: totalAmount,
		offerId: offerResponse[0].id,
	});
	eventEmitter.emit("socket-event", {
		command: "new-offer",
		data: { offer: offerResponse[0] },
	});
	return offerResponse[0];
};
