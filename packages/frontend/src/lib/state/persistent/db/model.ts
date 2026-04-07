import type { DBSchema } from 'idb';
import type { EncryptedStore } from './models/types';

export interface OpenPlebDB extends DBSchema {
	'encrypted-lnurl': {
		key: string;
		value: EncryptedStore;
	};
	'encrypted-seed': {
		key: string;
		value: EncryptedStore;
	};
	'encrypted-settings': {
		key: string;
		value: EncryptedStore;
	};
	'encrypted-sessions': {
		key: string;
		value: EncryptedStore;
	};
}
