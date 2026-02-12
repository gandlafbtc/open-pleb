import { browser } from '$app/environment';
const STORAGE_KEY_ONBOARDED = 'openpleb-is-onboarded';
const STORAGE_KEY_USE_PW = 'openpleb-use-pw';

class LocalStorageState {
	private _isOnboarded: boolean;
	private _isUsePw: boolean;

	constructor() {
		const isOnboardedInitValue = browser
			? localStorage.getItem(STORAGE_KEY_ONBOARDED) === 'true'
			: false;
		this._isOnboarded = $state(isOnboardedInitValue);

		const isUsePwInitValue = browser
			? localStorage.getItem(STORAGE_KEY_USE_PW) === 'true'
			: false;
		this._isUsePw = $state(isUsePwInitValue);
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

	get isUsePw(): boolean {
		return this._isUsePw;
	}

	set isUsePw(value: boolean) {
		this._isUsePw = value;
		if (browser) {
			localStorage.setItem(STORAGE_KEY_USE_PW, String(value));
		}
	}
}

export const localstore = new LocalStorageState();
