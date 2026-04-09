import { DefaultStore } from '../helper/storeHelper.svelte';
import { createEncryptionHelper } from '../helper/encryptionHelper';
import type { Offer } from 'common/db/schema';
import { getUnixNow } from 'common/util';

const encryptionHelper = createEncryptionHelper<Offer>('encrypted-offers');

class OfferStore extends DefaultStore<Offer> {
	constructor() {
		super(encryptionHelper);
	}

	getOfferById(id: number): Offer | undefined {
		return this.data.find((offer: Offer) => offer.id === id);
	}

	async saveOffer(offer: Offer): Promise<void> {
		await this.addOrUpdate(offer.id.toString(), offer, 'id');
	}

	async removeOffer(id: number): Promise<void> {
		await this.remove(id.toString(), 'id');
	}

	async clearExpiredOffers(userSessionId?: string): Promise<void> {
		const offers = this.data;
		const now = getUnixNow();
		
		for (const offer of offers) {
			// Only remove expired offers that are NOT associated with the user
			if (offer.expiresAt && offer.expiresAt <= now) {
				const isUserOffer = offer.makerSessionId === userSessionId || 
				                   offer.takerSessionId === userSessionId;
				
				if (!isUserOffer) {
					await this.removeOffer(offer.id);
				}
			}
		}
	}
}

export const offerStore = new OfferStore();
