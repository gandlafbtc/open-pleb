import { env } from '$env/dynamic/public';
import { authState } from '$lib/state/auth.svelte';

const { PUBLIC_ADMIN_BACKEND_URL, PUBLIC_API_VERSION } = env;

export interface InviteCode {
	inviteCode: string;
	codeCreatedAt: number;
	codeExpiresAt?: number;
}

export interface GenerateCodesResponse {
	success: boolean;
	count: number;
	codes: InviteCode[];
}

export class InviteCodesService {
	private baseUrl: string;

	constructor() {
		this.baseUrl = `${PUBLIC_ADMIN_BACKEND_URL}/api/${PUBLIC_API_VERSION}/admin`;
	}

	/**
	 * Generate invite codes
	 */
	async generateCodes(count: number, expiresAt?: number): Promise<InviteCode[]> {
		const token = authState.token;
		if (!token) {
			throw new Error('Not authenticated');
		}

		const body: { count: number; expiresAt?: number } = { count };
		if (expiresAt) {
			body.expiresAt = expiresAt;
		}

		const response = await fetch(`${this.baseUrl}/generate-codes`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify(body)
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(errorText || 'Failed to generate codes');
		}

		const data: GenerateCodesResponse = await response.json();

		if (!data.success) {
			throw new Error('Failed to generate codes');
		}

		return data.codes;
	}
}

export const inviteCodesService = new InviteCodesService();
