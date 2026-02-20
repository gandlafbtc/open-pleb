import { DefaultStore } from '../helper/storeHelper.svelte';
import { createEncryptionHelper } from '../helper/encryptionHelper';
import type { SeedPhrase } from '../models/types';
import { generateMnemonic, validateMnemonic } from "@scure/bip39";
import { wordlist } from '@scure/bip39/wordlists/english.js';

const encryptionHelper = createEncryptionHelper<SeedPhrase>('encrypted-seed');

class SeedStore extends DefaultStore<SeedPhrase> {
	constructor() {
		super(encryptionHelper);
	}
	generateNew() {
		if (!this.data.length) {
			this.add({seedPhrase: generateMnemonic(wordlist,128)})
		}
	}
	replace(seedPhrase: SeedPhrase) {
		if (!validateMnemonic(seedPhrase.seedPhrase, wordlist)) {
			throw new Error("Could not replace seed: invalid seed");
		}
		this.data[0] = seedPhrase
	}
}

export const seedPhrase = new SeedStore();
