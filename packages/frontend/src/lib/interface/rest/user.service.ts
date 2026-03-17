import { getAppApiBaseUrl } from './const';

/**
 * Register a new user with the backend
 * @param pubkey - The user's public key in hex format
 * @param inviteCode - The invite code for registration
 * @throws Error if registration fails
 */
export const registerUser = async (pubkey: string, inviteCode: string): Promise<void> => {
	const payload = {
		pubkey,
		inviteCode: inviteCode.trim()
	};

	const response = await fetch(`${getAppApiBaseUrl()}/user/register`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	});

	if (!response.ok) {
		throw new Error(await response.text());
	}
};

/**
 * Check if a user is registered and invited
 * @param pubkey - The user's public key in hex format
 * @returns Object containing isInvited status
 * @throws Error if the check fails
 */
export const checkUserStatus = async (pubkey: string): Promise<{ isInvited: boolean }> => {
	const response = await fetch(`${getAppApiBaseUrl()}/user/${pubkey}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		throw new Error('Failed to connect');
	}

	return await response.json();
};
