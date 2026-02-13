import { DefaultStore } from '../helper/storeHelper.svelte';
import { createEncryptionHelper } from '../helper/encryptionHelper';
import type { LNURL } from '../models/types';
import { lnurlCallback, validateLnAddress } from "common/lnurl";
const lnurlEncryptionHelper = createEncryptionHelper<LNURL>('encrypted-lnurl');

class LnurlStore extends DefaultStore<LNURL> {
	constructor() {
		super(lnurlEncryptionHelper);
	}
	validate(lnurl: string) {
		return validateLnAddress(lnurl)
	}
	async verify(lnurl: string): Promise<boolean> {
		try {
			const cb = await lnurlCallback(lnurl)
			if (cb) {
				return true
			}
			else {
				return false
			}
		} catch (error) {
			console.error(error)
			return false
		}
	}
}

export const lnurl = new LnurlStore();
