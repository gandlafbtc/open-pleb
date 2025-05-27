export type PingData = {
   takers: number
   makers: number
   price: number
}

export const OFFER_STATE = {
	CREATED: 'CREATED',
	INVOICE_CREATED: 'INVOICE_CREATED',
	INVOICE_PAID: 'INVOICE_PAID',
	CLAIMED: 'CLAIMED',
	EXPIRED: 'EXPIRED',
	COMPLETED: 'COMPLETED',
	RECEIPT_SUBMITTED: 'RECEIPT_SUBMITTED',
	MARKED_WITH_ISSUE: 'MARKED_WITH_ISSUE',
	FOREFEIT: 'FOREFEIIT',
	DISPUTED: 'DISPUTED',
	RESOLVED: 'RESOLVED',
	ERROR: 'ERROR',
};

export const DISPUTE_RESPONSE = {
	FORFEIT: 'FORFEIT',
	COUNTER: 'COUNTER',
}

export interface UserInfo {
	pubkey: string;
	numberOfOffers: number;
	numberOfClaims: number;
	reviewsGiven: number;
	reviewsReceived: number;
	reviewScore: number;
}