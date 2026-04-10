import { DefaultStore } from '../helper/storeHelper.svelte';
import { createEncryptionHelper } from '../helper/encryptionHelper';
import type { FiatProvider } from 'common/db/schema';

const encryptionHelper = createEncryptionHelper<FiatProvider>('encrypted-providers');

class ProviderStore extends DefaultStore<FiatProvider> {
	constructor() {
		super(encryptionHelper);
	}

	getProviderById(id: number): FiatProvider | undefined {
		return this.data.find((provider: FiatProvider) => provider.id === id);
	}

	async saveProvider(provider: FiatProvider): Promise<void> {
		await this.addOrUpdate(provider.id.toString(), provider, 'id');
	}

	async removeProvider(id: number): Promise<void> {
		await this.remove(id.toString(), 'id');
	}

	async clearAll(): Promise<void> {
		await this.reset();
	}
}

export const providerStore = new ProviderStore();
