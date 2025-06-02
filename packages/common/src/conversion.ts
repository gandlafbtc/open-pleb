const getInitialValue = () => {
	let value = 100_000;
	switch (Bun.env.OPENPLEB_CURRENCY) {
		case "KRW": {
			value = 150_000_000;
			break;
		}
		case "JPY": {
			value = 15_000_000;
			break;
		}

		default:
			break;
	}
	return value;
};

let lastChecked = 0;
let lastResult = getInitialValue();
const checkExpiry = 60 * 1000; // 1 hour in milliseconds

let rateNotFound = false;

export const getConversionRate = async () => {
	if (lastChecked + checkExpiry > Date.now() && lastResult != null) {
		return lastResult;
	}
	switch (Bun.env.OPENPLEB_CURRENCY) {
		case "KRW": {
			lastResult = await getKRW();
			break;
		}
		default: {
			lastResult = await getOther();
			break;
		}
	}
	lastChecked = Date.now();
	return lastResult;
};

const getKRW = async () => {
	const priceSource = "https://api.upbit.com";

	const response = await fetch(`${priceSource}/v1/ticker?markets=KRW-BTC`);

	if (!response.ok) {
		throw new Error("Failed to fetch conversion rate from upbit");
	}
	const data = await response.json();
	return data[0].trade_price;
};

const getOther = async () => {
	if (rateNotFound) {
		return await getFallback()
	}
	const url = "https://blockchain.info/ticker?cors=true";
	const options = { method: "GET", headers: { accept: "application/json" } };
	const response = await fetch(url, options);
	if (!response.ok) {
		throw new Error("Failed to fetch conversion rate from blockchain.info");
	}
	const data = await response.json();
	const currencyShort = Bun.env.OPENPLEB_CURRENCY
	if (!currencyShort) {
		throw new Error("Failed to get currency short code from environment variable OPENPLEB_CURRENCY");
	}
	const ticker = currencyShort.toUpperCase()
	const rate = data[ticker]?.last
	if (!rate) {
		rateNotFound = true
		return await getFallback()
	}
	
	return Math.floor(rate)
};

const getFallback = async () => {
	const url = "https://api.coinbase.com/v2/exchange-rates?currency=BTC"
	const options = { method: "GET", headers: { accept: "application/json" } };
	const response = await fetch(url, options);
	if (!response.ok) {
		throw new Error("Failed to fetch conversion rate from coinbase.com");
	}
	const data = await response.json();
	const currencyShort = Bun.env.OPENPLEB_CURRENCY
	if (!currencyShort) {
		throw new Error("Failed to get currency short code from environment variable OPENPLEB_CURRENCY");
	}
	const ticker = currencyShort.toUpperCase()
	const rate = data.data.rates[ticker]
	if (!rate) {
		throw new Error(`Failed to find fallback conversion rate for ${ticker}`);
	}
	return Math.floor(rate)
};