import { DefaultStore } from '../helper/storeHelper.svelte';
import { createEncryptionHelper } from '../helper/encryptionHelper';
import type { SeedPhrase } from '../models/types';
import { generateMnemonic } from "@scure/bip39";
import { wordlist } from '@scure/bip39/wordlists/english.js';

const lnurlEncryptionHelper = createEncryptionHelper<SeedPhrase>('encrypted-seed');

class SeedStore extends DefaultStore<SeedPhrase> {
	constructor() {
		super(lnurlEncryptionHelper);
	}
	generateNew() {
		if (!this.data.length) {
			this.add({seedPhrase: generateMnemonic(wordlist,128)})
		}
	}
	replace(seedPhrase: SeedPhrase) {
		this.data[0] = seedPhrase
	}
}

export const seedPhrase = new SeedStore();
