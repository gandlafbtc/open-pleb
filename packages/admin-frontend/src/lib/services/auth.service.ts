import {env} from '$env/dynamic/public';
const { PUBLIC_API_VERSION, PUBLIC_ADMIN_BACKEND_URL} = env
interface NostrWindow extends Window {
	nostr?: {
		getPublicKey(): Promise<string>;
		signEvent(event: {
			kind: number;
			created_at: number;
			tags: string[][];
			content: string;
		}): Promise<{
			id: string;
			pubkey: string;
			created_at: number;
			kind: number;
			tags: string[][];
			content: string;
			sig: string;
		}>;
	};
}

declare const window: NostrWindow;

export interface AuthResponse {
	success: boolean;
	data: {
		user: {
			access_token: string;
			id: string;
		};
	} | null;
	message: string;
}

export interface ChallengeResponse {
	success: boolean;
	data: {
		challenge: string;
		expiresAt: number;
	} | null;
	message: string;
}

export class AuthService {
	private baseUrl: string;

	constructor() {
		this.baseUrl = `${PUBLIC_ADMIN_BACKEND_URL}/api/${PUBLIC_API_VERSION}/admin/auth`;
	}

	/**
	 * Check if window.nostr is available
	 */
	isNostrAvailable(): boolean {
		return typeof window !== 'undefined' && !!window.nostr;
	}

	/**
	 * Get the user's public key from the Nostr extension
	 */
	async getPublicKey(): Promise<string> {
		if (!this.isNostrAvailable()) {
			throw new Error('Nostr extension not found. Please install a Nostr extension like nos2x or Alby.');
		}
		return await window.nostr!.getPublicKey();
	}

	/**
	 * Request a challenge from the server
	 */
	async requestChallenge(npub: string): Promise<string> {
		const response = await fetch(`${this.baseUrl}/challenge`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ npub })
		});

		const data: ChallengeResponse = await response.json();

		if (!data.success || !data.data) {
			throw new Error(data.message || 'Failed to get challenge');
		}

		return data.data.challenge;
	}

	/**
	 * Login using Nostr extension to sign the challenge
	 */
	async login(): Promise<string> {
		if (!this.isNostrAvailable()) {
			throw new Error('Nostr extension not found. Please install a Nostr extension like nos2x or Alby.');
		}

		// Get public key from extension
		const pubkey = await this.getPublicKey();
		
		// Convert hex pubkey to npub
		const npub = await this.hexToNpub(pubkey);

		// Request challenge
		const challenge = await this.requestChallenge(npub);

		// Create the login URL
		const loginUrl = `${this.baseUrl}/login`;

		// Create NIP-98 event
		const unsignedEvent = {
			kind: 27235,
			created_at: Math.floor(Date.now() / 1000),
			tags: [
				['u', loginUrl],
				['method', 'POST']
			],
			content: challenge
		};

		// Sign the event with Nostr extension
		const signedEvent = await window.nostr!.signEvent(unsignedEvent);

		// Encode the signed event in base64
		const base64Event = btoa(JSON.stringify(signedEvent));

		// Call login endpoint with Authorization header
		const response = await fetch(loginUrl, {
			method: 'POST',
			headers: {
				'Authorization': `Nostr ${base64Event}`
			}
		});

		const data: AuthResponse = await response.json();

		if (!data.success || !data.data) {
			throw new Error(data.message || 'Login failed');
		}

		return data.data.user.access_token;
	}

	/**
	 * Convert hex pubkey to npub (bech32 encoding)
	 */
	private async hexToNpub(hex: string): Promise<string> {
		// Import bech32 encoding from @scure/base
		const { bech32 } = await import('@scure/base');
		
		// Convert hex to bytes
		const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
		
		// Encode as bech32
		const words = bech32.toWords(bytes);
		return bech32.encode('npub', words);
	}
}

export const authService = new AuthService();
