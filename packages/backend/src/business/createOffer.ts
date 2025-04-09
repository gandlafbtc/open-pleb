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
/**
 * Represents the data required to create a new offer in the system.
 * An offer is created by a maker who wants to pay a banking QR code with Bitcoin.
 */
export interface OfferData {
	/**
	 * the amount in local currency (fiat) that needs to be paid via the QR code.
	 * This is the amount that will be converted to bitcoin using the conversion rate.
	 * must be a positive number.
	 */
	amount: number;
	/**
	 * The conversion rate from local currency to bitcoin.
	 * This is used to calculate the amount of bitcoin that needs to be paid.
	 * must be a positive number.
	 */
	conversionRate: number;
	/**
	 * The banking QR code data as a string.
	 * This contains the payment information that the taker will use
	 * to make the payment on behalf of the maker.
	 * Usually contains recipient, amount, and reference information.
	 */
	qrCode: string;
	/**
	 * The public key of the maker creating the offer.
	 */
	pubkey: string;
}
/**
 * Creates a new offer in the system based on the provided offer data.
 * This is a core business function that handles:
 * 1. Conversion of fiat amount to Bitcoin (sats)
 * 2. Calculation of platform and taker fees
 * 3. Creation of a mint quote for the total amount
 * 4. Storing the offer data in the database
 * 5. Emitting a socket event to notify clients of the new offer
 *
 * @param offerData - Data required to create the offer(amount, conversion rate, QR code, pubkey)
 * @returns Promise resolving to the created Offer object
 */
export const createOffer = async (offerData: OfferData): Promise<Offer> => {
	const { amount, conversionRate, qrCode, pubkey } = offerData;
	// Convert the fiat amount to satoshis using the conversion rate
	// 100000000 satoshis = 1 BTC
	const satsAmount = Math.ceil((100000000 / conversionRate) * amount);

	// Calculate the platform fee based on percentage from environment variables
	const platformFeePercentage = Math.ceil(
		(satsAmount * Number.parseFloat(Bun.env.PUBLIC_PLATFORM_FEE_PERCENTAGE!)) /
			100,
	);
	// Get flat rate fees from environment variables
	const platformFeeFlatRate = Number.parseFloat(
		Bun.env.PUBLIC_PLATFORM_FEE_FLAT_RATE!,
	);
	const takerFeeFlatRate = Number.parseFloat(
		Bun.env.PUBLIC_TAKER_FEE_FLAT_RATE!,
	);
	// Calculate the taker fee based on percentage from environment variables		
	const takerFeePercentage = Math.ceil(
		(satsAmount * Number.parseFloat(Bun.env.PUBLIC_TAKER_FEE_PERCENTAGE!)) /
			100,
	);
	// Sum all fees and the original sats amount to get the total amount
	// that will be requested from the maker
	const totalAmount =
		satsAmount +
		platformFeePercentage +
		takerFeePercentage +
		platformFeeFlatRate +
		takerFeeFlatRate;
	// Initialize Cashu mint with URL from environment variables
	const cashuMint = new CashuMint(Bun.env.PUBLIC_MINT_URL!);

	// Create a mint quote for the total amount
	// This will return a Lightning invoice that the maker will pay
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

	// Emit a socket event to notify clients about the new offer
	// This enables real-time updates in the UI
	eventEmitter.emit("socket-event", {
		command: "new-offer",
		data: { offer: offerResponse[0] },
	});
	
	return offerResponse[0];
};
