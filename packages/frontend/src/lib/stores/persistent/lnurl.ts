import { get, writable } from 'svelte/store';
import { createDefaultStoreFunctions } from './helper/storeHelper';
import { createEncryptionHelper, type EncryptionHelper } from './helper/encryptionHelper';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { schnorr } from '@noble/curves/secp256k1';
import type { KeyPair, LNURL } from './db/models/types';

const lnurlEncryptionHelper = createEncryptionHelper<LNURL>('encrypted-lnurl');

const createLnurlStore = (encryptionHelper: EncryptionHelper<LNURL>) => {
	const initial: Array<LNURL> = [];
	const store = writable<Array<LNURL>>(initial);
	const defaults = createDefaultStoreFunctions(encryptionHelper, store);

	return {
		...defaults,
		...store
	};
};
export const lnurlStore = createLnurlStore(lnurlEncryptionHelper);
