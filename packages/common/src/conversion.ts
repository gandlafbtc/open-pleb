const priceSource = 'https://api.upbit.com';

let lastChecked = 0;
let lastResult: number | null = null;
const checkExpiry = 60 * 1000; // 1 hour in milliseconds

export const getConversionRate = async () => {
	if (lastChecked + checkExpiry > Date.now() && lastResult != null) {
		return lastResult;
	}
	const response = await fetch(`${priceSource}/v1/ticker?markets=KRW-BTC`);

	if (!response.ok) {
		throw new Error('Failed to fetch conversion rate');
	}

	const data = await response.json();
	lastResult = data[0].trade_price;
	lastChecked = Date.now();
	return lastResult;
};
