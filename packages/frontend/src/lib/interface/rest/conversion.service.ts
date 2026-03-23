import { getAppApiBaseUrl } from './const';

/**
 * Fetch conversion rate from the backend
 * @returns Conversion rate (e.g., BTC to USD)
 * @throws Error if the fetch fails
 */
export const getConversionRate = async (): Promise<number> => {
	const response = await fetch(`${getAppApiBaseUrl()}/conversion`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		throw new Error('Failed to fetch conversion rate');
	}

	const data = await response.json();
	return data.conversion;
};
