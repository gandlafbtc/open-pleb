import { getAppApiBaseUrl } from './const';

export type EnvSettings = {
	OPENPLEB_ENV: 'dev' | 'prod';
	OPENPLEB_PLATFORM_FEE_PERCENTAGE: number;
	OPENPLEB_PLATFORM_FEE_FLAT_RATE: number;
	OPENPLEB_TAKER_FEE_PERCENTAGE: number;
	OPENPLEB_TAKER_FEE_FLAT_RATE: number;
	OPENPLEB_BOND_PERCENTAGE: number;
	OPENPLEB_BOND_FLAT_RATE: number;
	OPENPLEB_CURRENCY: string;
	OPENPLEB_MAX_FIAT_AMOUNT: number;
	OPENPLEB_MINT_URL: string;
};

/**
 * Fetch environment settings from the backend
 * @returns Environment settings object
 * @throws Error if the fetch fails
 */
export const getEnvSettings = async (): Promise<EnvSettings> => {
	const response = await fetch(`${getAppApiBaseUrl()}/envsettings`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		throw new Error('Failed to fetch environment settings');
	}

	const data = await response.json();
	return data.env;
};
