import { browser } from '$app/environment';

const STORAGE_KEY_TOKEN = 'openpleb-admin-token';

class AuthState {
	private _token: string | null;

	constructor() {
		const tokenInitValue = browser ? localStorage.getItem(STORAGE_KEY_TOKEN) : null;
		this._token = $state(tokenInitValue);
	}

	get token(): string | null {
		return this._token;
	}

	set token(value: string | null) {
		this._token = value;
		if (browser) {
			if (value) {
				localStorage.setItem(STORAGE_KEY_TOKEN, value);
			} else {
				localStorage.removeItem(STORAGE_KEY_TOKEN);
			}
		}
	}

	get isAuthenticated(): boolean {
		return !!this._token;
	}

	login(token: string) {
		this.token = token;
	}

	logout() {
		this.token = null;
	}
}

export const authState = new AuthState();
