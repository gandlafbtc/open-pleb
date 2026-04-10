import type { FiatProvider } from 'common/db/schema';

class ProviderState {
	private _providers = $state<FiatProvider[]>([]);

	get providers(): FiatProvider[] {
		return this._providers;
	}

	setProviders(providers: FiatProvider[]): void {
		this._providers = providers;
	}

	addProvider(provider: FiatProvider): void {
		this._providers = [...this._providers, provider];
	}

	updateProvider(provider: FiatProvider): void {
		const index = this._providers.findIndex((p) => p.id === provider.id);
		if (index !== -1) {
			this._providers[index] = provider;
		}
	}

	removeProvider(id: number): void {
		this._providers = this._providers.filter((p) => p.id !== id);
	}

	getProviderById(id: number): FiatProvider | undefined {
		return this._providers.find((p) => p.id === id);
	}

	clearProviders(): void {
		this._providers = [];
	}
}

export const providerState = new ProviderState();
