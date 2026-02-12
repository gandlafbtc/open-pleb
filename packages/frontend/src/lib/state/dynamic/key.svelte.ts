import { deriveKeyAsync } from "common/encryption";
import { DEFAULT_SALT } from "../static/pass";

class EncryptionKey {
	private _key: Uint8Array;
	constructor () {
		this._key = new Uint8Array();
	}
	public get key() : Uint8Array {
		return this._key
	}
	
	public set key(v : Uint8Array) {
		this._key = v;
	}
	public async initKeyFromPass(pass: Uint8Array) {
		const k = await deriveKeyAsync(pass, DEFAULT_SALT)
		this._key=k
	}
};

export const key = new EncryptionKey();
