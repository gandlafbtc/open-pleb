import { offerState } from '$lib/state/dynamic/offer.svelte';
import { offerStore } from '$lib/state/persistent/db/repos/offer';
import { blindSessionState } from '$lib/state/dynamic/blindSession.svelte';
import { toast } from 'svelte-sonner';
import { getAppApiBaseUrl } from './const';
import type { Offer } from 'common/db/schema';

// API Types
export interface CreateOfferRequest {
	sessionId: string;
	fiatAmount: number;
	fiatProviderId: number | null;
	fiatAddress: string;
	description?: string;
}

export interface CreateOfferResponse {
	success: boolean;
	offer?: {
		id: number;
		status: string;
		fiatCurrency: string;
		fiatAmount: number;
		fiatProviderId: number | null;
		fiatAddress: string;
		conversionRate: number;
		satsAmount: number;
		platformFeeFlatRate: number;
		platformFeePercentage: number;
		takerFeeFlatRate: number;
		takerFeePercentage: number;
		makerBondFlatRate: number;
		makerBondPercentage: number;
		takerBondFlatRate: number;
		takerBondPercentage: number;
		makerSessionId: string;
		updatedAt: number;
		expiresAt: number;
		description: string | null;
		receiptImg: string;
	};
	error?: string;
}

// API Functions
async function createOfferApi(request: CreateOfferRequest): Promise<CreateOfferResponse> {
	const response = await fetch(`${getAppApiBaseUrl()}/offer`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(request),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || "Failed to create offer");
	}

	return response.json();
}

export class OfferService {
	/**
	 * Initialize the offer service
	 * Loads any existing offers from storage
	 */
	async init(): Promise<void> {
		try {
			await offerStore.init();
			await this.loadOffers();
			await this.clearExpiredOffers();
		} catch (error) {
			console.error('Failed to initialize offer service:', error);
		}
	}

	/**
	 * Load all offers from storage into state
	 */
	private async loadOffers(): Promise<void> {
		const offers = offerStore.data;
		offerState.setOffers(offers);
	}

	/**
	 * Create a new offer
	 */
	async createOffer(request: CreateOfferRequest): Promise<Offer> {
			const response: CreateOfferResponse = await createOfferApi(request);

			if (!response.success || !response.offer) {
				throw new Error(response.error || 'Failed to create offer');
			}

			// Convert the API response to a full Offer object
			const offer: Offer = {
				id: response.offer.id,
				status: response.offer.status,
				fiatCurrency: response.offer.fiatCurrency,
				fiatAmount: response.offer.fiatAmount,
				fiatProviderId: response.offer.fiatProviderId,
				fiatAddress: response.offer.fiatAddress,
				conversionRate: response.offer.conversionRate,
				satsAmount: response.offer.satsAmount,
				platformFeeFlatRate: response.offer.platformFeeFlatRate,
				platformFeePercentage: response.offer.platformFeePercentage,
				takerFeeFlatRate: response.offer.takerFeeFlatRate,
				takerFeePercentage: response.offer.takerFeePercentage,
				makerBondFlatRate: response.offer.makerBondFlatRate,
				makerBondPercentage: response.offer.makerBondPercentage,
				takerBondFlatRate: response.offer.takerBondFlatRate,
				takerBondPercentage: response.offer.takerBondPercentage,
				makerSessionId: response.offer.makerSessionId,
				takerSessionId: null,
				makerReputationStake: null,
				takerReputationStake: null,
				makerBondAndEscrow: null,
				takerBond: null,
				updatedAt: response.offer.updatedAt,
				paidAt: null,
				claimedAt: null,
				completedAt: null,
				expiresAt: response.offer.expiresAt,
				receiptImg: response.offer.receiptImg,
				makerFeedback: null,
				takerFeedback: null,
				resolutionReason: null,
				description: response.offer.description,
				takerRewardToken: null,
				makerRefundToken: null,
				makerReputationToken: null,
				takerReputationToken: null,
				takerRewardPubkeyLock: null,
				makerRefundPubkeyLock: null,
			};

			// Save to storage
			await offerStore.saveOffer(offer);

			// Update state
			offerState.addOffer(offer);
			return offer;
	}

	/**
	 * Update an existing offer in storage and state
	 */
	async updateOffer(offer: Offer): Promise<void> {
		try {
			await offerStore.saveOffer(offer);
			offerState.updateOffer(offer);
		} catch (error) {
			console.error('Failed to update offer:', error);
			toast.error('Failed to update offer');
		}
	}

	/**
	 * Delete an offer from storage and state
	 */
	async deleteOffer(id: number): Promise<void> {
		try {
			await offerStore.removeOffer(id);
			offerState.removeOffer(id);
			toast.success('Offer deleted');
		} catch (error) {
			console.error('Failed to delete offer:', error);
			toast.error('Failed to delete offer');
		}
	}

	/**
	 * Clear expired offers that are not associated with the user
	 */
	async clearExpiredOffers(): Promise<void> {
		try {
			const currentSession = blindSessionState.currentSession;
			await offerStore.clearExpiredOffers(currentSession?.sessionId);
			await this.loadOffers();
		} catch (error) {
			console.error('Failed to clear expired offers:', error);
		}
	}

	/**
	 * Get an offer by ID
	 */
	getOfferById(id: number): Offer | undefined {
		return offerState.getOfferById(id);
	}

	/**
	 * Get all offers
	 */
	getAllOffers(): Offer[] {
		return offerState.offers;
	}

	/**
	 * Get only active (non-expired) offers
	 */
	getActiveOffers(): Offer[] {
		return offerState.activeOffers;
	}
}

export const offerService = new OfferService();
