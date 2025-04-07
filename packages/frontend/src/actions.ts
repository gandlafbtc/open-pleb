import { PUBLIC_API_VERSION, PUBLIC_BACKEND_URL } from '$env/static/public';

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
	try {
		const response = await fetch(`${PUBLIC_BACKEND_URL}/api/${PUBLIC_API_VERSION}/offers`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(offer)
		});
		if (!response.ok) {
			throw new Error('Failed to create offer');
		}
		const data = await response.json();
		return data.offer;
	} catch (error) {
		throw error;
	}
};
