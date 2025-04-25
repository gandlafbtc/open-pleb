import { env } from '$env/dynamic/public';
import { getWalletWithUnit, keysStore, mintsStore, receiveEcash } from '@gandlaf21/cashu-wallet-engine';
import { toast } from 'svelte-sonner';
import { get } from 'svelte/store';
import { ensureError } from './errors';
import { CheckStateEnum, getDecodedToken } from '@cashu/cashu-ts';

const { PUBLIC_BACKEND_URL, PUBLIC_API_VERSION, PUBLIC_MINT_URL } = env;
export type Offer = {
	amount: number;
	qrCode: string;
	pubkey: string;
	currency?: string;
	description?: string;
};

export type OfferResponse = {
	id: string;
	invoice: string;
};

export const createNewOffer = async (offer: Offer): Promise<OfferResponse> => {
		const response = await fetch(`${PUBLIC_BACKEND_URL}/api/${PUBLIC_API_VERSION}/offers`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(offer)
		});
		if (!response.ok) {
			throw new Error(await response.text());
		}
		const data = await response.json();
		return data.offer;
};


const doClaim = async (token:string) => {
	try {
		const t = getDecodedToken(token)
		console.log(t)
		await receiveEcash(token, {privkey: get(keysStore)[0].privateKey})
		toast.success("received!")
	} catch (error) {
		const err = ensureError(error);
		console.error(err);
		toast.error(err.message);
	}
	finally {
	}
}

export const checkIfRedeemed = async (reward: string) => {
	try {
		const token = getDecodedToken(reward)
		const wallet = await getWalletWithUnit(get(mintsStore), PUBLIC_MINT_URL, "sat")
		const states = await wallet.checkProofsStates(token.proofs);
		const spentOrPending = states.find(s=> s.state===CheckStateEnum.PENDING || s.state===CheckStateEnum.SPENT)

		if (spentOrPending) {
			toast.success("Reward already redeemed!")
			return;
		}
		doClaim(reward)

	} catch (error) {
		return
	}
}