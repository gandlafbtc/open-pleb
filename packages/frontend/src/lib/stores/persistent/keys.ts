import { get, writable } from 'svelte/store';
import { createDefaultStoreFunctions } from './helper/storeHelper';
import { createEncryptionHelper, type EncryptionHelper } from './helper/encryptionHelper';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { schnorr } from '@noble/curves/secp256k1';
import type { KeyPair } from './db/models/types';

const keysEncryptionHelper = createEncryptionHelper<KeyPair>('encrypted-keys');

const createKeysStore = (encryptionHelper: EncryptionHelper<KeyPair>, keysId: number) => {
	const initialKeys: Array<KeyPair> = [];
	const store = writable<Array<KeyPair>>(initialKeys);
	const { set, subscribe, update } = store;
	const {
		addOrUpdate,
		remove,
		clear,
		init: initialize,
		reEncrypt,
		reset,
		getBy,
		getAllBy,
		add
	} = createDefaultStoreFunctions(encryptionHelper, store);

	const createNewKeypair = async () => {
		const counters = get(store).map((kp) => kp.counter);
		let largest = -1;

		for (let i = 0; i < counters.length; i++) {
			if (counters[i] > largest) {
				largest = counters[i];
			}
		}

		largest++;

		const sk = schnorr.utils.randomPrivateKey();
		if (!sk) {
			throw new Error('Could not derive private key');
		}
		const pk = schnorr.getPublicKey(sk);
		await add({
			counter: largest,
			publicKey: bytesToHex(pk),
			privateKey: bytesToHex(sk)
		});
		return { publicKey: bytesToHex(pk), privateKey: bytesToHex(sk) };
	};

	const init = async () => {
		await initialize();
		if (!get(store).length) {
			await createNewKeypair();
		}
	};

	return {
		set,
		subscribe,
		update,
		addOrUpdate,
		remove,
		init,
		reset,
		clear,
		reEncrypt,
		getBy,
		getAllBy,
		createNewKeypair
	};
};
export const keysStore = createKeysStore(keysEncryptionHelper, 0);
