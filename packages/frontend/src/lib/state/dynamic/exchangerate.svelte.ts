import { getConversionRate } from "$lib/interface/rest/conversion.service";

class ExchangeRate {
	private _rate: number | undefined = $state();

	constructor() {}

	public get rate(): number | undefined {
		return this._rate;
	}

	public set rate(v: number | undefined) {
		this._rate = v;
	}

	async init() {
		try {
			this._rate = await getConversionRate();
		} catch (error) {
			console.error('Failed to fetch exchange rate:', error);
			// Don't throw - allow app to continue even if exchange rate fetch fails
		}
	}
}

export const exchangeRate = new ExchangeRate();
