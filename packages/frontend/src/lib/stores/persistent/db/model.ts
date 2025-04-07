import { type DBSchema } from 'idb';
import type { EncryptedStore } from './models/types';

export interface OpenPlebDB extends DBSchema {
	'encrypted-keys': {
		key: string;
		value: EncryptedStore;
	};
}
