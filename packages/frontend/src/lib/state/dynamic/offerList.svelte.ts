import type { PublicOffer } from 'common/types';
import { clock } from '../clock.svelte';

class OfferListState {
	private _offers: PublicOffer[] = $state([]);
	private _isLoading: boolean = $state(false);

	get offers(): PublicOffer[] {
		return this._offers;
	}

	get isLoading(): boolean {
		return this._isLoading;
	}

	get activeOffers(): PublicOffer[] {
		return this._offers.filter((offer) => {
			if (!offer.expiresAt) return true;
			return offer.expiresAt > clock.time;
		});
	}

	getOfferById(id: number): PublicOffer | undefined {
		return this._offers.find((offer) => offer.id === id);
	}

	setOffers(offers: PublicOffer[]): void {
		this._offers = offers;
	}

	addOffer(offer: PublicOffer): void {
		const existingIndex = this._offers.findIndex((o) => o.id === offer.id);
		if (existingIndex >= 0) {
			this._offers[existingIndex] = offer;
		} else {
			this._offers.push(offer);
		}
	}

	updateOffer(offer: PublicOffer): void {
		const index = this._offers.findIndex((o) => o.id === offer.id);
		if (index >= 0) {
			this._offers[index] = offer;
		}
	}

	removeOffer(id: number): void {
		this._offers = this._offers.filter((offer) => offer.id !== id);
	}

	setLoading(loading: boolean): void {
		this._isLoading = loading;
	}

	clearOffers(): void {
		this._offers = [];
	}
}

export const offerListState = new OfferListState();
