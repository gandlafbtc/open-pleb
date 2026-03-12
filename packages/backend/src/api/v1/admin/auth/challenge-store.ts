import { bytesToHex } from "@noble/hashes/utils.js";
import { schnorr } from "@noble/curves/secp256k1.js";
import { log } from "../../../../util/logger";

interface ChallengeData {
	challenge: string;
	npub: string;
	expiresAt: number;
}

class ChallengeStore {
	private challenges: Map<string, ChallengeData> = new Map();
	private readonly CHALLENGE_TTL = 5 * 60 * 1000; // 5 minutes
	private cleanupInterval: Timer | null = null;

	constructor() {
		// Start cleanup interval to remove expired challenges every minute
		this.startCleanup();
	}

	private startCleanup() {
		this.cleanupInterval = setInterval(() => {
			this.removeExpired();
		}, 60 * 1000); // Run every minute
	}

	generateChallenge(npub: string): { challenge: string; expiresAt: number } {
		const challenge = bytesToHex(schnorr.utils.randomSecretKey());
		const expiresAt = Date.now() + this.CHALLENGE_TTL;

		this.challenges.set(challenge, {
			challenge,
			npub,
			expiresAt,
		});

		log.debug(`Generated challenge for npub: ${npub}`);
		return { challenge, expiresAt };
	}

	verifyAndConsume(challenge: string, npub: string): boolean {
		const data = this.challenges.get(challenge);

		if (!data) {
			log.warn(`Challenge not found: ${challenge}`);
			return false;
		}

		if (data.npub !== npub) {
			log.warn(`Challenge npub mismatch. Expected: ${data.npub}, Got: ${npub}`);
			return false;
		}

		if (Date.now() > data.expiresAt) {
			log.warn(`Challenge expired: ${challenge}`);
			this.challenges.delete(challenge);
			return false;
		}

		// Consume the challenge (delete it to prevent replay)
		this.challenges.delete(challenge);
		log.debug(`Challenge verified and consumed for npub: ${npub}`);
		return true;
	}

	private removeExpired() {
		const now = Date.now();
		let removedCount = 0;

		for (const [challenge, data] of this.challenges.entries()) {
			if (now > data.expiresAt) {
				this.challenges.delete(challenge);
				removedCount++;
			}
		}

		if (removedCount > 0) {
			log.debug(`Removed ${removedCount} expired challenges`);
		}
	}

	// For testing/debugging
	getChallengeCount(): number {
		return this.challenges.size;
	}

	// Cleanup on shutdown
	destroy() {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval);
			this.cleanupInterval = null;
		}
		this.challenges.clear();
	}
}

// Singleton instance
export const challengeStore = new ChallengeStore();
