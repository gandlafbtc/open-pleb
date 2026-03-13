import { authState } from '$lib/state/auth.svelte';
import { ADMIN_API_BASE_URL } from './const';
import { loadUsers } from './user.service';


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

		const response = await fetch(`${ADMIN_API_BASE_URL}/generate-codes`, {
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
		await loadUsers()
		return data.codes;
	}
}

export const inviteCodesService = new InviteCodesService();
