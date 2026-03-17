import { settings } from '$lib/state/persistent/db/repos/settings';
import { PUBLIC_BACKEND_URL, PUBLIC_API_VERSION } from '$env/static/public';
import { toast } from 'svelte-sonner';
import { delay } from 'common/util';
import { browser } from '$app/environment';

const BACKEND_URL_KEY = 'backend_url';

class BackendUrl {
	private _url: string = $state(PUBLIC_BACKEND_URL);

	constructor() {}

	public get url(): string {
		return this._url;
	}

	/**
	 * Validate that the URL points to a valid OpenPleb backend instance
	 * by attempting to fetch environment settings
	 */
	private async validateBackendUrl(url: string): Promise<void> {
		try {
			const response = await fetch(`${url}/api/${PUBLIC_API_VERSION}/envsettings`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				throw new Error('Backend did not respond with valid data');
			}

			const data = await response.json();
			
			// Check if the response has the expected structure
			if (!data.env || typeof data.env !== 'object') {
				throw new Error('Invalid backend response structure');
			}

			// Verify it has expected OpenPleb environment fields
			if (!data.env.OPENPLEB_ENV) {
				throw new Error('Not a valid OpenPleb backend instance');
			}
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to validate backend: ${error.message}`);
			}
			throw new Error('Failed to connect to backend. Please check the URL and try again.');
		}
	}

	public async setUrl(newUrl: string): Promise<void> {
		// Validate URL format
		if (!newUrl) {
			throw new Error('Backend URL cannot be empty');
		}

		// Remove trailing slash if present
		const cleanUrl = newUrl.endsWith('/') ? newUrl.slice(0, -1) : newUrl;

		// Basic URL validation
		try {
			new URL(cleanUrl);
		} catch {
			throw new Error('Invalid URL format');
		}

		// Validate that it's a valid OpenPleb backend
		await this.validateBackendUrl(cleanUrl);

		// Save to settings
		await settings.setSetting(BACKEND_URL_KEY, cleanUrl);
		this._url = cleanUrl;
		toast.promise(delay(1000), {
			loading: "Backend updated! Restarting...", 
			success: ()=> {
				if (browser) {
					window.location.reload()
				}
				return "Restart"
			}
		})
	}

	public async resetToDefault(): Promise<void> {
		await settings.deleteSetting(BACKEND_URL_KEY);
		this._url = PUBLIC_BACKEND_URL;
	}

	public init(): void {
		// Load from settings or use default
		const savedUrl = settings.getSetting(BACKEND_URL_KEY);
		this._url = savedUrl || PUBLIC_BACKEND_URL;
	}
}

export const backendUrl = new BackendUrl();
