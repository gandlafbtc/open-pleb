export type EncryptedStore = {
	ciphertext: Uint8Array;
	nonce: Uint8Array;
	t: number;
	// preimage: hex
};

export type KeyPair = {
	counter: number;
	publicKey: string;
	privateKey: string;
};
export type LNURL = {
	address: string;
};

export type SeedPhrase = {
	seedPhrase: string;
};

export type Setting = {
	key: string;
	value: string;
};

export type BlindSession = {
	sessionId: string;
	role: 'maker' | 'taker';
	expiresAt: number;
	createdAt: number;
	BAT: string;
	isActive: boolean;
};
