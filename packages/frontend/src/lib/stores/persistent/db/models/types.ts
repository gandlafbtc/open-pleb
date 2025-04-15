export type EncryptedStore = {
	cypher: Uint8Array;
	iv: string;
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
