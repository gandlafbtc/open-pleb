import { DefaultStore } from '../helper/storeHelper.svelte';
import { createEncryptionHelper } from '../helper/encryptionHelper';
import type { LNURL } from '../models/types';

const lnurlEncryptionHelper = createEncryptionHelper<LNURL>('encrypted-lnurl');

class LnurlStore extends DefaultStore<LNURL> {
	constructor() {
		super(lnurlEncryptionHelper);
	}
}

export const lnurl = new LnurlStore();
