import type { BlindSession } from '../persistent/db/models/types';

class BlindSessionState {
	private _currentSession: BlindSession | null = $state(null);
	private _isLoading: boolean = $state(false);

	get currentSession(): BlindSession | null {
		return this._currentSession;
	}

	get isActive(): boolean {
		if (!this._currentSession) return false;
		return this._currentSession.expiresAt > Date.now();
	}

	get isLoading(): boolean {
		return this._isLoading;
	}

	get timeRemaining(): number {
		if (!this._currentSession) return 0;
		const remaining = this._currentSession.expiresAt - Date.now();
		return Math.max(0, remaining);
	}

	get role(): 'maker' | 'taker' | null {
		return this._currentSession?.role ?? null;
	}

	setSession(session: BlindSession | null): void {
		this._currentSession = session;
	}

	setLoading(loading: boolean): void {
		this._isLoading = loading;
	}

	clearSession(): void {
		this._currentSession = null;
	}
}

export const blindSessionState = new BlindSessionState();
