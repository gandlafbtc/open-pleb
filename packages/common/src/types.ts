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
	FOREFEIT: 'FOREFEIT',
	DISPUTED: 'DISPUTED',
	RESOLVED: 'RESOLVED',
	ERROR: 'ERROR',
};

export const DISPUTE_RESPONSE = {
	FORFEIT: 'FORFEIT',
	COUNTER: 'COUNTER',
}

export const CURRENCIES = ["KRW, JPY", "LAK"]

export interface Environment {
	OPENPLEB_PLATFORM_FEE_PERCENTAGE: number 
	OPENPLEB_PLATFORM_FEE_FLAT_RATE: number,
	OPENPLEB_TAKER_FEE_PERCENTAGE: number,
	OPENPLEB_TAKER_FEE_FLAT_RATE: number,
	OPENPLEB_BOND_PERCENTAGE: number,
	OPENPLEB_BOND_FLAT_RATE:number,
	OPENPLEB_CURRENCY: string,
	OPENPLEB_MAX_FIAT_AMOUNT:number,
	OPENPLEB_MINT_URL: string
}

export const RESOLUTION_PATHS = {
	MAKER_WINS: 'MAKER_WINS',
	TAKER_WINS: 'TAKER_WINS',
	SPLIT: 'SPLIT',
	RETURN: 'RETURN',
}

export interface UserInfo {
	pubkey: string;
	numberOfOffers: number;
	numberOfClaims: number;
	reviewsGiven: number;
	reviewsReceived: number;
	reviewScore: number;
}