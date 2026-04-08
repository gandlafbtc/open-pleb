import { environment } from "../../env";
import { getUnixNow } from "common/util";
import { OFFER_STATE } from "common/types";
import * as sessionRepository from "../../repository/app/session.repository";
import * as offerRepository from "../../repository/app/offer.repository";
import { log } from "../../util/logger";
import { getConversionRate } from "../../util/conversion";
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
 * Calculate fees based on sats amount and environment configuration
 */
function calculateFees(satsAmount: number): CalculatedFees {
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
	return Math.floor(fiatAmount / conversionRate);
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
	const fees = calculateFees(satsAmount);

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
