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
		
		// Find first non-expired session
		return sessions.find((session: BlindSession) => session.expiresAt > now);
	}

	async saveSession(session: BlindSession): Promise<void> {
		await this.addOrUpdate(session.sessionId, session, 'sessionId');
	}

	async clearSession(sessionId: string): Promise<void> {
		await this.remove(sessionId, 'sessionId');
	}

	async clearExpiredSessions(): Promise<void> {
		const sessions = this.data;
		const now = getUnixNow();
		
		for (const session of sessions) {
			if (session.expiresAt <= now) {
				await this.clearSession(session.sessionId);
			}
		}
	}
}

export const sessionStore = new SessionStore();
