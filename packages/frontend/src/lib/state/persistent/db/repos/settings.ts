import { DefaultStore } from '../helper/storeHelper.svelte';
import { createEncryptionHelper } from '../helper/encryptionHelper';
import type { Setting } from '../models/types';

const encryptionHelper = createEncryptionHelper<Setting>('encrypted-settings');

class SettingsStore extends DefaultStore<Setting> {
	constructor() {
		super(encryptionHelper);
	}

	getSetting(key: string): string | undefined {
		return this.getBy(key, 'key')?.value;
	}

	async setSetting(key: string, value: string): Promise<void> {
		await this.addOrUpdate(key, { key, value }, 'key');
	}

	async deleteSetting(key: string): Promise<void> {
		await this.remove(key, 'key');
	}
}

export const settings = new SettingsStore();
