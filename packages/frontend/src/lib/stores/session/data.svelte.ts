import { get, writable } from "svelte/store";
import type { Claim, Offer, Receipt } from "@openPleb/common/db/schema";
import { PUBLIC_API_VERSION, PUBLIC_BACKEND_URL } from "$env/static/public";
import { keysStore } from "cashu-wallet-engine";

export interface Data {
	offers: Offer[];
	claims: Claim[];
	receipts: Receipt[];
}

export const createDataStore = () => {
	let offers: Offer[] = $state([])
	let claims: Claim[]  = $state([])
	let receipts: Receipt[]  = $state([])
	const init = async () => {
		const response = await fetch(
			`${PUBLIC_BACKEND_URL}/api/${PUBLIC_API_VERSION}/data/${
				get(keysStore)[0]?.publicKey.slice(2)
			}`,
		);
		const data: Data = await response.json();
		offers.push(...data.offers);
		claims.push(...data.claims);
		receipts.push(...data.receipts);
	};

	const fetchForId = async (id: string) => {
		const response = await fetch(
			`${PUBLIC_BACKEND_URL}/api/${PUBLIC_API_VERSION}/data/for/${id}`,
		);
		const data: { claim: Claim; offer: Offer; receipt: Receipt } =
			await response.json();
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
		offers.push(offer);
	};
	const newReceipt = (receipt: Receipt) => {
		receipts.push(receipt);
	};

	const newClaim = (claim: Claim) => {
		claims.push(claim);
	};

	const updateOffer = (offer: Offer) => {
		const index = offers.findIndex((o) => o.id === offer.id);
		if (index !== -1) {
			offers[index] = offer;
		} else {
			offers.push(offer);
		}
	};

	const updateReceipt = (receipt: Receipt) => {
		const index = receipts.findIndex((r) => r.id === receipt.id);
		if (index !== -1) {
			receipts[index] = receipt;
			console.log('Updating receipt', receipt);

		} else {
			receipts.push(receipt);
		}
	};

	const updateClaim = (claim: Claim) => {
		const index = claims.findIndex((c) => c.id === claim.id);
		if (index !== -1) {
			claims[index] = claim;
		} else {
			claims.push(claim);
		}
	};


	return {
		offers,
		receipts,
		claims,
		init,
		newOffer,
		updateOffer,
		newReceipt,
		newClaim,
		fetchForId,
		updateReceipt,
	};
};

export const dataStore = createDataStore();
