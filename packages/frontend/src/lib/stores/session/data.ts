import { get, writable } from 'svelte/store';
import type { Claim, Offer, Receipt } from '@openPleb/common/db/schema';
import { PUBLIC_API_VERSION, PUBLIC_BACKEND_URL } from '$env/static/public';
import { keysStore } from 'cashu-wallet-engine';

export interface Data {
	offers: Offer[];
	claims: Claim[];
	receipts: Receipt[];
}

export const createDataStore = () => {
	const store = writable<Data | undefined>();
	const { set, subscribe, update } = store;
	const init = async () => {
		const response = await fetch(
			`${PUBLIC_BACKEND_URL}/api/${PUBLIC_API_VERSION}/data/${get(keysStore)[0].publicKey}`
		);
		const data: Data = await response.json();
		store.set(data);
	};

	const fetchForId = async (id: string) => {
		const response = await fetch(`${PUBLIC_BACKEND_URL}/api/${PUBLIC_API_VERSION}/data/for/${id}`);
		const data: { claim: Claim; offer: Offer; receipt: Receipt } = await response.json();
		console.log(data);
		if (data.offer) {
			updateOffer(data.offer);
		}
		if (data.claim) {
			updateClaim(data.claim);
		}
		if (data.receipt) {
			updateReceipt(data.receipt);
		}
	};

	const newOffer = (offer: Offer) => {
		update((state) => {
			if (!state) return state;
			state.offers.push(offer);
			return state;
		});
	};

	const updateOffer = (offer: Offer) => {
		update((state) => {
			if (!state) return state;
			const index = state.offers.findIndex((o) => o.id === offer.id);
			if (index !== -1) {
				state.offers[index] = offer;
			} else {
				state.offers.push(offer);
			}
			return state;
		});
	};

	const newReceipt = (receipt: Receipt) => {
		update((state) => {
			if (!state) return state;
			state.receipts.push(receipt);
			return state;
		});
	};

	const updateReceipt = (receipt: Receipt) => {
		update((state) => {
			if (!state) return state;
			const index = state.receipts.findIndex((r) => r.offerId === receipt.offerId);
			if (index !== -1) {
				state.receipts[index] = receipt;
			} else {
				state.receipts.push(receipt);
			}
			return state;
		});
	};

	const newClaim = (claim: Claim) => {
		update((state) => {
			if (!state) return state;
			state.claims.push(claim);
			return state;
		});
	};

	const updateClaim = (claim: Claim) => {
		update((state) => {
			if (!state) return state;
			const index = state.claims.findIndex((c) => c.offerId === claim.offerId);
			if (index !== -1) {
				state.claims[index] = claim;
			} else {
				state.claims.push(claim);
			}
			return state;
		});
	};

	return {
		set,
		subscribe,
		update,
		init,
		newOffer,
		updateOffer,
		newReceipt,
		newClaim,
		fetchForId,
		updateReceipt
	};
};

export const dataStore = createDataStore();
