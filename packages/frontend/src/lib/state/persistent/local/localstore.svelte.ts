import { browser } from '$app/environment';

const STORAGE_KEY_ONBOARDED = 'openpleb-is-onboarded';

class LocalStorageState {
	private _isOnboarded: boolean;

	constructor() {
		const isOnboardedInitValue = browser
			? localStorage.getItem(STORAGE_KEY_ONBOARDED) === 'true'
			: false;
		this._isOnboarded = $state(isOnboardedInitValue);
	}

	get isOnboarded(): boolean {
		return this._isOnboarded;
	}

	set isOnboarded(value: boolean) {
		this._isOnboarded = value;
		if (browser) {
			localStorage.setItem(STORAGE_KEY_ONBOARDED, String(value));
		}
	}
}

export const localstore = new LocalStorageState();
