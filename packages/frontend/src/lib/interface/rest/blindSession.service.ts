import { blindSessionState } from '$lib/state/dynamic/blindSession.svelte';
import { sessionStore } from '$lib/state/persistent/db/repos/session';
import type { BlindSession } from '$lib/state/persistent/db/models/types';
import { toast } from 'svelte-sonner';

export class BlindSessionService {
	/**
	 * Initialize the blind session service
	 * Loads any existing active session from storage
	 */
	async init(): Promise<void> {
		try {
			await sessionStore.init();
			await this.loadActiveSession();
			await sessionStore.clearExpiredSessions();
		} catch (error) {
			console.error('Failed to initialize blind session service:', error);
		}
	}

	/**
	 * Load the active session from storage
	 */
	private async loadActiveSession(): Promise<void> {
		const activeSession = sessionStore.getActiveSession();
		if (activeSession) {
			blindSessionState.setSession(activeSession);
		}
	}

	/**
	 * Open a new blind session with the specified role
	 * Consumes a blind auth token from the wallet
	 */
	async openSession(role: 'maker' | 'taker'): Promise<boolean> {
		try {
			blindSessionState.setLoading(true);

			// Check if there's already an active session
			if (blindSessionState.isActive) {
				toast.error('You already have an active blind session');
				return false;
			}

			// TODO: Consume a blind auth token from wallet
			// This will be implemented when the blind auth token flow is ready
			// For now, we'll create a mock session
			
			const sessionId = crypto.randomUUID();
			const now = Date.now();
			const expiresAt = now + (30 * 60 * 1000); // 30 minutes from now

			const newSession: BlindSession = {
				sessionId,
				role,
				createdAt: now,
				expiresAt,
				BAT: 'mock-token' // TODO: Replace with actual token
			};

			// Save to storage
			await sessionStore.saveSession(newSession);

			// Update state
			blindSessionState.setSession(newSession);

			toast.success(`Blind session opened as ${role}`);
			return true;
		} catch (error) {
			console.error('Failed to open blind session:', error);
			toast.error('Failed to open blind session');
			return false;
		} finally {
			blindSessionState.setLoading(false);
		}
	}

	/**
	 * Close the current blind session
	 */
	async closeSession(): Promise<void> {
		try {
			const currentSession = blindSessionState.currentSession;
			if (!currentSession) {
				return;
			}

			blindSessionState.setLoading(true);

			// Remove from storage
			await sessionStore.clearSession(currentSession.sessionId);

			// Clear state
			blindSessionState.clearSession();

			toast.success('Session closed');
		} catch (error) {
			console.error('Failed to close blind session:', error);
			toast.error('Failed to close blind session');
		} finally {
			blindSessionState.setLoading(false);
		}
	}

	/**
	 * Check if the current session is still valid
	 * If expired, automatically close it
	 */
	async checkSessionValidity(): Promise<boolean> {
		const currentSession = blindSessionState.currentSession;
		if (!currentSession) {
			return false;
		}

		if (!blindSessionState.isActive) {
			// Session expired, close it
			await this.closeSession();
			toast.info('Your blind session has expired');
			return false;
		}

		return true;
	}

	/**
	 * Get the remaining time in milliseconds
	 */
	getTimeRemaining(): number {
		return blindSessionState.timeRemaining;
	}

	/**
	 * Format the remaining time as a human-readable string
	 */
	formatTimeRemaining(): string {
		const ms = this.getTimeRemaining();
		if (ms <= 0) return '0:00';

		const minutes = Math.floor(ms / 60000);
		const seconds = Math.floor((ms % 60000) / 1000);
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}
}

export const blindSessionService = new BlindSessionService();
