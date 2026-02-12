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
