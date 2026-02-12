import type { StoreNames } from 'idb';
import { DB } from '../db';
import type { EncryptedStore } from '../models/types';
import type { OpenPlebDB } from '../model';
import { key } from '$lib/state/dynamic/key.svelte';
import * as encryption from "common/encryption";

export type EncryptionHelper<T> = {
	encrypt: (o: T[]) => Promise<void>;
	decrypt: () => Promise<T[]>;
};

export const createEncryptionHelper = <T>(
	dbStoreName: StoreNames<OpenPlebDB>
): EncryptionHelper<T> => {
	const encrypt = async <T>(o: T): Promise<void> => {
			const db = await DB.getInstance();
			if (!key.key.length) {
				throw new Error('Key not set');
			}
			const { nonce, ciphertext } = await encryption.encrypt<T>(key.key, o);
			db.put(dbStoreName, { ciphertext, nonce, t: Date.now() }, 'default');
	};

	const decrypt = async <T>(): Promise<T[]> => {
			const db = await DB.getInstance();
			console.log("bb")

			const encrypted = (await db.get(dbStoreName, 'default')) as EncryptedStore;
			if (!encrypted) {
				return [];
			}
			const k = key.key;
			if (!k.length) {
				throw new Error('Key not set');
			}

			const decrypted = encryption.decrypt<T>(k, encrypted.nonce, encrypted.ciphertext) as T[];
			return decrypted;
	};
	return {
		encrypt,
		decrypt
	};
};
