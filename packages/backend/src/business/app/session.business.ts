import { environment } from "../../env";
import { getUnixNow } from "common/util";
import * as sessionRepository from "../../repository/app/session.repository";
import { log } from "../../util/logger";

interface AuthProof {
	id: string;
	secret: string;
	C: string;
	dleq?: unknown;
}

interface MintStateResponse {
	state: {
		Y: string;
		state: "SPENT" | "UNSPENT" | "PENDING";
		witness: string | null;
	};
}

/**
 * Validate and sanitize auth proof
 * Ensures only valid fields are present and within size limits
 */
function validateAuthProof(authProof: unknown): AuthProof {
	if (!authProof || typeof authProof !== "object") {
		throw new Error("Invalid auth proof: must be an object");
	}

	const proof = authProof as Record<string, unknown>;

	// Validate id field
	if (typeof proof.id !== "string") {
		throw new Error("Invalid auth proof: id must be a string");
	}
	if (proof.id.length > 66) {
		throw new Error("Invalid auth proof: id exceeds maximum length of 66 characters");
	}

	// Validate secret field
	if (typeof proof.secret !== "string") {
		throw new Error("Invalid auth proof: secret must be a string");
	}
	if (proof.secret.length > 64) {
		throw new Error("Invalid auth proof: secret exceeds maximum length of 64 characters");
	}

	// Validate C field
	if (typeof proof.C !== "string") {
		throw new Error("Invalid auth proof: C must be a string");
	}
	if (proof.C.length > 66) {
		throw new Error("Invalid auth proof: C exceeds maximum length of 64 characters");
	}

	// Return sanitized proof with only allowed fields
	return {
		id: proof.id,
		secret: proof.secret,
		C: proof.C,
	};
}

/**
 * Validate BAT with the mint by checking its state
 */
async function checkBatState(authProof: AuthProof): Promise<boolean> {
	const mintUrl = environment.OPENPLEB_MINT_URL;
	if (!mintUrl) {
		throw new Error("OPENPLEB_MINT_URL not configured");
	}

	try {
		const response = await fetch(`${mintUrl}/v1/auth/blind/checkstate`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ auth_proof: authProof }),
		});

		if (!response.ok) {
			log.warn(`Mint checkstate failed: ${response.status} ${response.statusText}`);
			return false;
		}

		const data: MintStateResponse = await response.json();
		// State should be "UNSPENT" for a valid, unspent BAT
		return data.state.state === "UNSPENT";
	} catch (error) {
		log.error("Error checking BAT state with mint:", error);
		throw new Error("Failed to validate BAT with mint");
	}
}

/**
 * Spend BAT with the mint
 */
async function spendBat(authProof: AuthProof): Promise<boolean> {
	const mintUrl = environment.OPENPLEB_MINT_URL;
	if (!mintUrl) {
		throw new Error("OPENPLEB_MINT_URL not configured");
	}

	try {
		const response = await fetch(`${mintUrl}/v1/auth/blind/spend`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ auth_proof: authProof }),
		});

		if (!response.ok) {
			log.warn(`Mint spend failed: ${response.status} ${response.statusText}`);
			return false;
		}

		const data: MintStateResponse = await response.json();
		return data.state.state === "SPENT";
	} catch (error) {
		log.error("Error spending BAT with mint:", error);
		throw new Error("Failed to spend BAT with mint");
	}
}

/**
 * Validate and spend a BAT token with the mint
 * Returns the BAT string representation for storage
 */
export async function validateAndSpendBat(authProof: AuthProof): Promise<string> {
	// First check if BAT is valid and unspent
	// const isValid = await checkBatState(authProof);
	// if (!isValid) {
	// 	throw new Error("BAT is invalid or already spent");
	// }

	// Spend the BAT
	const spent = await spendBat(authProof);
	if (!spent) {
		throw new Error("Failed to spend BAT");
	}

	// Return a string representation of the BAT for storage
	// Using the secret as the unique identifier
	return authProof.secret;
}

/**
 * Create a new blind session
 */
export async function createBlindSession(
	authProof: unknown,
	role: string
): Promise<{ sessionId: string; expiresAt: number; createdAt: number }> {
	// Validate role
	if (role !== "maker" && role !== "taker") {
		throw new Error("Invalid role. Must be 'maker' or 'taker'");
	}

	// Validate and sanitize the auth proof
	const validatedProof = validateAuthProof(authProof);

	// Validate and spend the BAT with the mint
	const bat = await validateAndSpendBat(validatedProof);

	// Check if this BAT has already been used to create a session
	const existingSession = await sessionRepository.getSessionByBat(bat);
	if (existingSession) {
		throw new Error("BAT already used");
	}

	// Create session with 30-minute expiry
	const now = getUnixNow();
	const expiresAt = now + 30 * 60; // 30 minutes

	const session = await sessionRepository.createSession({
		bat,
		expiresAt,
		createdAt: now,
		isMaker: role === "maker",
	});

	log.info(`Created blind session: ${session.id} (${role})`);

	return {
		sessionId: session.id,
		expiresAt: session.expiresAt!,
		createdAt: session.createdAt,
	};
}
