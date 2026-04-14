import { DefaultStore } from '../helper/storeHelper.svelte';
import { createEncryptionHelper } from '../helper/encryptionHelper';
import type { BlindSession } from '../models/types';
import { getUnixNow } from 'common/util';

const encryptionHelper = createEncryptionHelper<BlindSession>('encrypted-sessions');

class SessionStore extends DefaultStore<BlindSession> {
	constructor() {
		super(encryptionHelper);
	}

	getActiveSession(): BlindSession | undefined {
		const sessions = this.data;
		const now = getUnixNow();
		
		// Find first non-expired and active session
		return sessions.find((session: BlindSession) => 
			session.expiresAt > now && session.isActive
		);
	}

	async saveSession(session: BlindSession): Promise<void> {
		await this.addOrUpdate(session.sessionId, session, 'sessionId');
	}

	async clearSession(sessionId: string): Promise<void> {
		// Soft delete: set isActive to false instead of removing
		const sessions = this.data;
		const session = sessions.find((s: BlindSession) => s.sessionId === sessionId);
		if (session) {
			session.isActive = false;
			await this.addOrUpdate(sessionId, session, 'sessionId');
		}
	}

	async clearExpiredSessions(): Promise<void> {
		const sessions = this.data;
		const now = getUnixNow();
		for (const session of sessions) {
			if (session.expiresAt <= now && session.isActive) {
				await this.clearSession(session.sessionId);
			}
		}
	}
}

export const sessionStore = new SessionStore();
