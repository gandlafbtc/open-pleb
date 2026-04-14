import { log } from "./logger";
import { getBackendNostrKeys } from "./offer-wallet";
import { bytesToHex } from "@noble/hashes/utils.js";
import { pubkeyToNpub } from "common/encoding";
import { hexToBytes } from "@noble/hashes/utils.js";

/**
 * Registers a pubkey directly with the OIDC provider (bypassing invite system)
 * This is used for system accounts like the backend wallet
 */
async function registerPubkeyWithOIDC(pubkeyHex: string): Promise<void> {
	const npub = pubkeyToNpub(hexToBytes(pubkeyHex));
	
	const res = await fetch(`${Bun.env.OPENPLEB_NOSTR_OIDC_HOST}/api/admin/users`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${Bun.env.OPENPLEB_NOSTR_OIDC_ADMIN_TOKEN}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			npub: npub,
			preferredLanguage: 'en',
			isAdmin: false,
			active: true
		})
	});
	
	if (!res.ok) {
		throw new Error(`error ${res.status} when creating user on oidc service: ${await res.text()}`);
	}
}

/**
 * Ensures the backend's Nostr pubkey is registered with the OIDC provider
 * This should be called during server initialization
 */
export async function ensureBackendPubkeyRegistered(): Promise<void> {
	try {
		const keys = await getBackendNostrKeys();
		const pubkeyHex = bytesToHex(keys.pubkey);
		const npub = pubkeyToNpub(keys.pubkey);
		
		log.info(`Checking if backend pubkey is registered with OIDC provider: ${npub}`);
		
		// Check if the user already exists
		const checkResponse = await fetch(
			`${Bun.env.OPENPLEB_NOSTR_OIDC_HOST}/api/admin/users/${npub}`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${Bun.env.OPENPLEB_NOSTR_OIDC_ADMIN_TOKEN}`,
				},
			}
		);
		
		if (checkResponse.ok) {
			log.info("Backend pubkey already registered with OIDC provider ✅");
			return;
		}
		
		if (checkResponse.status !== 404) {
			// Some other error occurred
			const errorText = await checkResponse.text();
			log.warn(`Unexpected response when checking OIDC registration: ${checkResponse.status} - ${errorText}`);
		}
		
		// User doesn't exist, register it
		log.info("Registering backend pubkey with OIDC provider...");
		await registerPubkeyWithOIDC(pubkeyHex);
		log.info("Backend pubkey registered with OIDC provider ✅");
	} catch (error) {
		log.error(`Failed to ensure backend pubkey registration: ${error}`);
		throw error;
	}
}
