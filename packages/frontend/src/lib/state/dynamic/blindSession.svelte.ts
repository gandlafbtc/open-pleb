import type { BlindSession } from '../persistent/db/models/types';
import { clock } from '../clock.svelte';

class BlindSessionState {
	private _currentSession: BlindSession | null = $state(null);
	private _isLoading: boolean = $state(false);

	get currentSession(): BlindSession | null {
		return this._currentSession;
	}

	get isActive(): boolean {
		if (!this._currentSession) return false;
		// Both expiresAt and clock.time are in seconds
		return this._currentSession.expiresAt > clock.time;
	}

	get isLoading(): boolean {
		return this._isLoading;
	}

	get timeRemaining(): number {
		if (!this._currentSession) return 0;
		// Both expiresAt and clock.time are in seconds, convert to milliseconds
		const remainingSeconds = this._currentSession.expiresAt - clock.time;
		return Math.max(0, remainingSeconds * 1000);
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
