import { browser } from '$app/environment';

const STORAGE_KEY_OFFER_FILTERS = 'openpleb-offer-filters';

class OfferFilterState {
	private _selectedProviderIds: number[];

	constructor() {
		const storedFilters = browser
			? localStorage.getItem(STORAGE_KEY_OFFER_FILTERS)
			: null;
		
		const initialValue = storedFilters 
			? JSON.parse(storedFilters) 
			: [];
		
		this._selectedProviderIds = $state(initialValue);
	}

	get selectedProviderIds(): number[] {
		return this._selectedProviderIds;
	}

	toggleProvider(id: number): void {
		const index = this._selectedProviderIds.indexOf(id);
		if (index === -1) {
			this._selectedProviderIds = [...this._selectedProviderIds, id];
		} else {
			this._selectedProviderIds = this._selectedProviderIds.filter(pid => pid !== id);
		}
		this.saveToLocalStorage();
	}

	clearFilters(): void {
		this._selectedProviderIds = [];
		this.saveToLocalStorage();
	}

	hasActiveFilters(): boolean {
		return this._selectedProviderIds.length > 0;
	}

	private saveToLocalStorage(): void {
		if (browser) {
			localStorage.setItem(STORAGE_KEY_OFFER_FILTERS, JSON.stringify(this._selectedProviderIds));
		}
	}
}

export const offerFilterState = new OfferFilterState();
