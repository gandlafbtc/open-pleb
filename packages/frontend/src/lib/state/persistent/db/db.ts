import { openDB, deleteDB, type IDBPDatabase } from 'idb';
import { toast } from 'svelte-sonner';
import { ensureError } from 'common/errors';
import type { OpenPlebDB } from './model';

export const DB_VERSION = 2;
export const DB_NAME = 'openpleb-db';

export class DB {
	private static _db: IDBPDatabase<OpenPlebDB> | undefined = undefined;

	static getInstance = async () => {
		if (this._db) {
			return this._db;
		}
		const database = await this.openDatabase();
		this._db = database;
		return this._db;
	};

	static async openDatabase() {
		const db = await openDB<OpenPlebDB>(DB_NAME, DB_VERSION, {
			upgrade: (db, oldVersion) => {
				if (!oldVersion) {
					db.createObjectStore('encrypted-lnurl');
					db.createObjectStore('encrypted-seed');
					db.createObjectStore('encrypted-settings');
				}
				if (oldVersion < 2) {
					if (!db.objectStoreNames.contains('encrypted-settings')) {
						db.createObjectStore('encrypted-settings');
					}
				}
			},
			blocked: () => {
				// …
			},
			blocking: () => {
				// …
			},
			terminated: () => {
				// …
			}
		});
		return db;
	}

	static async deleteDatabase() {
		try {
			await deleteDB(DB_NAME);
		} catch (error) {
			const err = ensureError(error);
			console.error(err);
			toast.error(err.message);
		}
	}

	static async close() {
		throw new Error('Not implemented');
	}
}
