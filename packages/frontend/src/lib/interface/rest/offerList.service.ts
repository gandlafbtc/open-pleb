import { offerListState } from '$lib/state/dynamic/offerList.svelte';
import { getAppApiBaseUrl } from './const';
import type { PublicOffer } from 'common/types';
import { socket } from '$lib/interface/ws/ws';
import { RoomIds } from 'common/ws-types';

// API Types
export interface GetListedOffersResponse {
	success: boolean;
	offers?: PublicOffer[];
	error?: string;
}

// API Functions
async function getListedOffersApi(): Promise<GetListedOffersResponse> {
	const response = await fetch(`${getAppApiBaseUrl()}/offer/listed`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || "Failed to fetch listed offers");
	}

	return response.json();
}

export class OfferListService {
	private unsubscribeHandler?: () => void;

	/**
	 * Initialize the offer list service
	 * Fetches the initial list of public offers and subscribes to WebSocket updates
	 */
	async init(): Promise<void> {
		try {
			await this.fetchListedOffers();
			this.subscribeToGlobalRoom();
		} catch (error) {
			console.error('Failed to initialize offer list service:', error);
		}
	}

	/**
	 * Subscribe to the global WebSocket room to receive offer:listed events
	 */
	private subscribeToGlobalRoom(): void {
		const globalRoom = RoomIds.global();
		
		// Subscribe to the global room
		socket.subscribe(globalRoom);
		
		// Register handler for offer:listed events
		this.unsubscribeHandler = socket.onOfferListed((data) => {
			console.log('Received offer:listed event:', data);
			this.handleOfferListed(data.offer);
		});
		
		console.log('Subscribed to global room for offer updates');
	}

	/**
	 * Clean up subscriptions
	 */
	destroy(): void {
		if (this.unsubscribeHandler) {
			this.unsubscribeHandler();
			this.unsubscribeHandler = undefined;
		}
		
		// Unsubscribe from the global room
		socket.unsubscribe(RoomIds.global());
	}

	/**
	 * Fetch all listed offers from the API
	 */
	async fetchListedOffers(): Promise<void> {
		try {
			offerListState.setLoading(true);
			const response = await getListedOffersApi();

			if (response.success && response.offers) {
				offerListState.setOffers(response.offers);
			} else {
				throw new Error(response.error || 'Failed to fetch listed offers');
			}
		} catch (error) {
			console.error('Failed to fetch listed offers:', error);
			throw error;
		} finally {
			offerListState.setLoading(false);
		}
	}

	/**
	 * Handle a new offer being listed (from WebSocket)
	 */
	handleOfferListed(offer: PublicOffer): void {
		offerListState.addOffer(offer);
	}

	/**
	 * Get an offer by ID
	 */
	getOfferById(id: number): PublicOffer | undefined {
		return offerListState.getOfferById(id);
	}

	/**
	 * Get all offers
	 */
	getAllOffers(): PublicOffer[] {
		return offerListState.offers;
	}

	/**
	 * Get only active (non-expired) offers
	 */
	getActiveOffers(): PublicOffer[] {
		return offerListState.activeOffers;
	}

	/**
	 * Check if offers are currently loading
	 */
	isLoading(): boolean {
		return offerListState.isLoading;
	}
}

export const offerListService = new OfferListService();
