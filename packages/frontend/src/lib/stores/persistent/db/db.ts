import { openDB, deleteDB, type IDBPDatabase } from 'idb';
import { toast } from 'svelte-sonner';
import { ensureError } from '$lib/errors';
import type { OpenPlebDB } from './model';

export const DB_VERSION = 3;
export const DB_NAME = 'openpleb-db';

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
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
			upgrade: (db, oldVersion, newVersion, transaction, event) => {
				if (!oldVersion) {
					db.createObjectStore('encrypted-lnurl');
				}
			},
			blocked: (currentVersion, blockedVersion, event) => {
				// …
			},
			blocking: (currentVersion, blockedVersion, event) => {
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
