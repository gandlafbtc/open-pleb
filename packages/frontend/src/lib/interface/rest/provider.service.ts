import { providerState } from '$lib/state/dynamic/provider.svelte';
import { providerStore } from '$lib/state/persistent/db/repos/provider';
import { getAppApiBaseUrl } from './const';
import type { FiatProvider } from 'common/db/schema';

// API Functions
async function getProvidersApi(): Promise<FiatProvider[]> {
	const response = await fetch(`${getAppApiBaseUrl()}/providers`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch providers");
	}

	return response.json();
}

export class ProviderService {
	/**
	 * Initialize the provider service
	 * Loads any existing providers from storage and fetches from backend
	 */
	async init(): Promise<void> {
		try {
			await providerStore.init();
			await this.loadProviders();
			//do in background, don't await
            this.fetchProviders();
		} catch (error) {
			console.error('Failed to initialize provider service:', error);
		}
	}

	/**
	 * Load all providers from storage into state
	 */
	private async loadProviders(): Promise<void> {
		const providers = providerStore.data;
		providerState.setProviders(providers);
	}

	/**
	 * Fetch providers from backend and sync to storage and state
	 */
	async fetchProviders(): Promise<void> {
		try {
			const providers = await getProvidersApi();
			
			// Clear existing providers in state and storage
			providerState.clearProviders();
			await providerStore.clearAll();
			
			// Save each provider to storage and state
			for (const provider of providers) {
				await providerStore.saveProvider(provider);
				providerState.addProvider(provider);
			}
		} catch (error) {
			console.error('Failed to fetch providers:', error);
		}
	}

	/**
	 * Get a provider by ID
	 */
	getProviderById(id: number): FiatProvider | undefined {
		return providerState.getProviderById(id);
	}

	/**
	 * Get all providers
	 */
	getAllProviders(): FiatProvider[] {
		return providerState.providers;
	}
}

export const providerService = new ProviderService();
