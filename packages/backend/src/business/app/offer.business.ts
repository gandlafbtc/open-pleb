import { environment } from "../../env";
import { getUnixNow } from "common/util";
import { OFFER_STATE, type PublicOffer } from "common/types";
import * as sessionRepository from "../../repository/app/session.repository";
import * as offerRepository from "../../repository/app/offer.repository";
import { log } from "../../util/logger";
import { getConversionRate } from "../../util/conversion";
import { SATS_PER_BTC } from "common/const";
import { createOfferWallet, claimAndVerifyToken } from '../../util/offer-wallet';
import { calcMakerTotalForOffer } from "common/calc";
import { broadcastToRoom } from "../../api/v1/app/socket/v1";
import { WS_COMMAND, RoomIds } from "common/ws-types";
import { Offer } from "common/db/schema";
type CreateOfferInput = {
	sessionId: string;
	fiatAmount: number;
	fiatProviderId: number | null;
	fiatAddress: string;
	description?: string;
}

interface CalculatedFees {
	platformFeeFlatRate: number;
	platformFeePercentage: number;
	takerFeeFlatRate: number;
	takerFeePercentage: number;
	makerBondFlatRate: number;
	makerBondPercentage: number;
	takerBondFlatRate: number;
	takerBondPercentage: number;
}

/**
 * Calculate fees based on environment configuration
 */
function calculateFees(): CalculatedFees {
	return {
		platformFeeFlatRate: environment.OPENPLEB_PLATFORM_FEE_FLAT_RATE,
		platformFeePercentage: environment.OPENPLEB_PLATFORM_FEE_PERCENTAGE,
		takerFeeFlatRate: environment.OPENPLEB_TAKER_FEE_FLAT_RATE,
		takerFeePercentage: environment.OPENPLEB_TAKER_FEE_PERCENTAGE,
		makerBondFlatRate: environment.OPENPLEB_BOND_FLAT_RATE,
		makerBondPercentage: environment.OPENPLEB_BOND_PERCENTAGE,
		takerBondFlatRate: environment.OPENPLEB_BOND_FLAT_RATE,
		takerBondPercentage: environment.OPENPLEB_BOND_PERCENTAGE,
	};
}


/**
 * Calculate sats amount from fiat amount using conversion rate
 */
function calculateSatsAmount(fiatAmount: number, conversionRate: number): number {
	return Math.floor((fiatAmount / conversionRate)*SATS_PER_BTC);
}

/**
 * Validate offer creation input
 */
function validateOfferInput(input: CreateOfferInput): void {
	// Validate fiat amount
	if (input.fiatAmount <= 0) {
		throw new Error("Fiat amount must be greater than 0");
	}

	if (input.fiatAmount > environment.OPENPLEB_MAX_FIAT_AMOUNT) {
		throw new Error(
			`Fiat amount exceeds maximum allowed: ${environment.OPENPLEB_MAX_FIAT_AMOUNT}`
		);
	}

	// Validate fiat address
	if (!input.fiatAddress || input.fiatAddress.trim().length === 0) {
		throw new Error("Fiat address is required");
	}

	if (input.fiatAddress.length > 500) {
		throw new Error("Fiat address is too long (max 500 characters)");
	}

	// Validate description if provided
	if (input.description && input.description.length > 1000) {
		throw new Error("Description is too long (max 1000 characters)");
	}
}

/**
 * Create a new offer
 */
export async function createOffer(input: CreateOfferInput) {
	// Validate input
	validateOfferInput(input);
    
	// Validate session
	const session = await sessionRepository.getSessionById(input.sessionId);
	if (!session) {
		throw new Error("Session not found");
	}

	// Check if session is expired
	const now = getUnixNow();
	if (session.expiresAt && session.expiresAt <= now) {
		throw new Error("Session has expired");
	}

	// Check if session is a maker session
	if (!session.isMaker) {
		throw new Error("Only maker sessions can create offers");
	}

	// Check if session already has an offer
	const existingOffer = await offerRepository.getOfferBySessionId(input.sessionId);
	if (existingOffer) {
		throw new Error("Session already has an offer");
	}

	// Get conversion rate
	const conversionRate = await getConversionRate();

	// Calculate sats amount
	const satsAmount = calculateSatsAmount(input.fiatAmount, conversionRate);

	// Calculate fees
	const fees = calculateFees();

	// Set expiry time (5 minutes from now)
	const expiresAt = now + 5 * 60;

	// Create offer
	const offer = await offerRepository.createOffer({
		status: OFFER_STATE.CREATED,
		fiatCurrency: environment.OPENPLEB_CURRENCY!,
		fiatAmount: input.fiatAmount,
		fiatProviderId: input.fiatProviderId,
		fiatAddress: input.fiatAddress,
		conversionRate,
		satsAmount,
		...fees,
		makerSessionId: input.sessionId,
		updatedAt: now,
		expiresAt,
		description: input.description || null,
		receiptImg: "",
	});

	log.info(`Created offer: ${offer.id} for session: ${input.sessionId}`);

	return offer;
}

/**
 * Pay and list an offer (maker pays bond + escrow with ecash)
 */
export async function payAndListOffer(offerId: number, ecashToken: string, sessionId: string) {
	// Get the offer
	const offer = await offerRepository.getOfferById(offerId);
	if (!offer) {
		throw new Error("Offer not found");
	}

	// Verify offer is in CREATED state
	if (offer.status !== OFFER_STATE.CREATED) {
		throw new Error(`Offer must be in CREATED state, current state: ${offer.status}`);
	}

	// Verify the session owns this offer
	if (offer.makerSessionId !== sessionId) {
		throw new Error("Session does not own this offer");
	}

	const expectedAmount = calcMakerTotalForOffer(offer)

	log.info(`Processing payment for offer ${offerId}: expecting ${expectedAmount} sats`);

	// Create wallet for this offer
	const wallet = await createOfferWallet(offerId);

	// Claim and verify the ecash token
	const receivedAmount = await claimAndVerifyToken(wallet, ecashToken, expectedAmount);

	// Update offer in database
	const now = getUnixNow();
	const updatedOffer = await offerRepository.updateOfferPayment(
		offerId,
		ecashToken,
		OFFER_STATE.INVOICE_PAID,
		now,
	);

	log.info(`Offer ${offerId} paid and listed successfully with ${receivedAmount} sats`);

	// Broadcast the new offer to all connected clients
	try {
		const publicOffer = stripSensitiveFields(updatedOffer);
		broadcastToRoom(RoomIds.global(), {
			type: WS_COMMAND.OFFER_LISTED,
			data: { offer: publicOffer }
		});
		log.debug(`Broadcasted offer ${offerId} to global room`);
	} catch (error) {
		log.error(`Failed to broadcast offer ${offerId}: ${error}`);
		// Don't fail the whole operation if broadcast fails
	}

	return updatedOffer;
}

/**
 * Strip sensitive fields from an offer to create a PublicOffer
 */
function stripSensitiveFields(offer: Offer): PublicOffer {
	return {
		id: offer.id,
		status: offer.status,
		fiatCurrency: offer.fiatCurrency,
		fiatAmount: offer.fiatAmount,
		fiatProviderId: offer.fiatProviderId,
		conversionRate: offer.conversionRate,
		satsAmount: offer.satsAmount,
		platformFeeFlatRate: offer.platformFeeFlatRate,
		platformFeePercentage: offer.platformFeePercentage,
		takerFeeFlatRate: offer.takerFeeFlatRate,
		takerFeePercentage: offer.takerFeePercentage,
		makerBondFlatRate: offer.makerBondFlatRate,
		makerBondPercentage: offer.makerBondPercentage,
		takerBondFlatRate: offer.takerBondFlatRate,
		takerBondPercentage: offer.takerBondPercentage,
		updatedAt: offer.updatedAt,
		expiresAt: offer.expiresAt,
		description: offer.description,
		claimedAt: null,
		completedAt: null,
		makerReputationStake: null,
		paidAt: null,
		takerReputationStake: null
	};
}

/**
 * Get all listed offers (public view)
 */
export async function getListedOffers(): Promise<PublicOffer[]> {
	const offers = await offerRepository.getListedOffers();
	return offers.map(stripSensitiveFields);
}
