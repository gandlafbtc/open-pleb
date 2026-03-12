import type Elysia from "elysia";
import { schnorr } from "@noble/curves/secp256k1.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";

import { ensureError } from "@openPleb/common/errors";
import { npubToPubkey } from "@openPleb/common/encoding";
import { log } from "../../../../util/logger";
import { challengeStore } from "./challenge-store";

// NIP-98: HTTP Auth with challenge
// https://github.com/nostr-protocol/nips/blob/master/98.md

interface NostrEvent {
	id: string;
	pubkey: string;
	created_at: number;
	kind: number;
	tags: string[][];
	content: string;
	sig: string;
}

function verifyNostrEvent(event: NostrEvent): boolean {
	// Verify event ID
	const serialized = JSON.stringify([
		0,
		event.pubkey,
		event.created_at,
		event.kind,
		event.tags,
		event.content,
	]);
	const hash = sha256(new TextEncoder().encode(serialized));
	const computedId = bytesToHex(hash);

	if (computedId !== event.id) {
		log.warn("Event ID mismatch");
		return false;
	}

	// Verify signature
	try {
		const isValid = schnorr.verify(
			hexToBytes(event.sig),
			hexToBytes(event.id),
			hexToBytes(event.pubkey)
		);
		return isValid;
	} catch (error) {
		log.error("Signature verification failed: {error}", { error });
		return false;
	}
}

function validateNip98Event(
	event: NostrEvent,
	url: string,
	method: string
): { valid: boolean; reason?: string } {
	// Must be kind 27235
	if (event.kind !== 27235) {
		return { valid: false, reason: "Invalid event kind, must be 27235" };
	}

	// Check timestamp (within 60 seconds)
	const now = Math.floor(Date.now() / 1000);
	const timeDiff = Math.abs(now - event.created_at);
	if (timeDiff > 60) {
		return { valid: false, reason: "Event timestamp too old or in future" };
	}

	// Verify u tag (URL)
	const uTag = event.tags.find((tag) => tag[0] === "u");
	if (!uTag || uTag[1] !== url) {
		return { valid: false, reason: "URL tag mismatch" };
	}

	// Verify method tag
	const methodTag = event.tags.find((tag) => tag[0] === "method");
	if (!methodTag || methodTag[1] !== method) {
		return { valid: false, reason: "Method tag mismatch" };
	}

	return { valid: true };
}

export const auth = (app: Elysia) =>
	app
		.post("/challenge", async ({ body, set }) => {
			try {
				const { npub } = body as { npub: string };

				if (!npub) {
					set.status = 400;
					return {
						success: false,
						message: "npub is required",
						data: null,
					};
				}

				// Verify this is the admin npub
				if (npub !== Bun.env.OPENPLEB_ADMIN_NPUB) {
					set.status = 403;
					return {
						success: false,
						message: "Unauthorized npub",
						data: null,
					};
				}

				const { challenge, expiresAt } = challengeStore.generateChallenge(npub);

				return {
					success: true,
					data: {
						challenge,
						expiresAt,
					},
					message: "Challenge generated",
				};
			} catch (error) {
				set.status = 500;
				const err = ensureError(error);
				log.error("Error generating challenge: {error}", { error: err });
				return {
					success: false,
					message: err.message,
					data: null,
				};
			}
		})
		.post("/login", async (context: any) => {
			const { headers, set, jwt, request } = context;
			try {
				// Get Authorization header (NIP-98)
				const authHeader = headers.authorization;
				if (!authHeader || !authHeader.startsWith("Nostr ")) {
					set.status = 401;
					return {
						success: false,
						message: "Missing or invalid Authorization header",
						data: null,
					};
				}

				// Extract and decode the base64 event
				const base64Event = authHeader.substring(6); // Remove "Nostr " prefix
				let eventJson: string;
				try {
					eventJson = atob(base64Event);
				} catch {
					set.status = 401;
					return {
						success: false,
						message: "Invalid base64 encoding",
						data: null,
					};
				}

				// Parse the event
				let event: NostrEvent;
				try {
					event = JSON.parse(eventJson);
				} catch {
					set.status = 401;
					return {
						success: false,
						message: "Invalid JSON in event",
						data: null,
					};
				}

				// Verify the event signature
				if (!verifyNostrEvent(event)) {
					set.status = 401;
					return {
						success: false,
						message: "Invalid event signature",
						data: null,
					};
				}

				// Validate NIP-98 specific requirements
				const url = new URL(request.url).toString();
				const validation = validateNip98Event(event, url, "POST");
				if (!validation.valid) {
					set.status = 401;
					return {
						success: false,
						message: validation.reason || "Invalid NIP-98 event",
						data: null,
					};
				}

				// Extract challenge from event content
				const challenge = event.content.trim();
				if (!challenge) {
					set.status = 401;
					return {
						success: false,
						message: "Challenge not found in event content",
						data: null,
					};
				}

				// Check if this is the admin pubkey
				const adminPubkey = npubToPubkey(Bun.env.OPENPLEB_ADMIN_NPUB!);
				const adminHex = bytesToHex(adminPubkey);
				if (event.pubkey !== adminHex) {
					set.status = 403;
					log.warn(`Login attempt with unauthorized pubkey: ${event.pubkey}`);
					return {
						success: false,
						message: "Unauthorized",
						data: null,
					};
				}

				// Verify and consume the challenge
				const challengeValid = challengeStore.verifyAndConsume(
					challenge,
					Bun.env.OPENPLEB_ADMIN_NPUB!
				);
				if (!challengeValid) {
					set.status = 401;
					return {
						success: false,
						message: "Invalid or expired challenge",
						data: null,
					};
				}

				// Generate JWT token
				const token = await jwt.sign({
					userId: Bun.env.OPENPLEB_ADMIN_NPUB,
					role: "admin",
				});

				log.info(`Admin login successful: ${event.pubkey}`);

				return {
					success: true,
					data: {
						user: {
							access_token: token,
							id: Bun.env.OPENPLEB_ADMIN_NPUB,
						},
					},
					message: "Login successful",
				};
			} catch (error) {
				set.status = 500;
				const err = ensureError(error);
				log.error("Error during login: {error}", { error: err });
				return {
					success: false,
					message: err.message,
					data: null,
				};
			}
		})

