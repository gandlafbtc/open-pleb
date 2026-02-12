import { gcm } from '@noble/ciphers/aes.js';
import { randomBytes } from '@noble/ciphers/utils.js';
import { argon2id } from '@noble/hashes/argon2.js';

/**
 * Custom error class for encryption-related errors
 */
export class EncryptionError extends Error {
	constructor(message: string, public readonly code: string) {
		super(message);
		this.name = 'EncryptionError';
	}
}

/**
 * Validates that a key has the correct length for AES encryption
 * @param key - The key to validate
 * @throws {EncryptionError} If key is invalid
 */
function validateKey(key: Uint8Array): void {
	if (!key || !(key instanceof Uint8Array)) {
		throw new EncryptionError('Key must be a Uint8Array', 'INVALID_KEY_TYPE');
	}
	
	const validKeySizes = [16, 24, 32]; // AES-128, AES-192, AES-256
	if (!validKeySizes.includes(key.length)) {
		throw new EncryptionError(
			`Key must be 16, 24, or 32 bytes (got ${key.length} bytes)`,
			'INVALID_KEY_SIZE'
		);
	}
}

/**
 * Validates that a nonce has the correct length for AES-GCM
 * @param nonce - The nonce to validate
 * @throws {EncryptionError} If nonce is invalid
 */
function validateNonce(nonce: Uint8Array): void {
	if (!nonce || !(nonce instanceof Uint8Array)) {
		throw new EncryptionError('Nonce must be a Uint8Array', 'INVALID_NONCE_TYPE');
	}
	
	// AES-GCM standard nonce size is 12 bytes (96 bits)
	if (nonce.length !== 12) {
		throw new EncryptionError(
			`Nonce must be 12 bytes for AES-GCM (got ${nonce.length} bytes)`,
			'INVALID_NONCE_SIZE'
		);
	}
}

/**
 * Validates that a payload is serializable
 * @param payload - The payload to validate
 * @throws {EncryptionError} If payload is invalid
 */
function validatePayload(payload: unknown): void {
	if (payload === null || payload === undefined) {
		throw new EncryptionError('Payload cannot be null or undefined', 'INVALID_PAYLOAD');
	}
	
	// Check if payload is a plain object or array (not a function, Date, etc.)
	const type = typeof payload;
	if (type !== 'object') {
		throw new EncryptionError(
			`Payload must be an object or array (got ${type})`,
			'INVALID_PAYLOAD_TYPE'
		);
	}
}

/**
 * Validates that ciphertext is valid
 * @param ciphertext - The ciphertext to validate
 * @throws {EncryptionError} If ciphertext is invalid
 */
function validateCiphertext(ciphertext: Uint8Array): void {
	if (!ciphertext || !(ciphertext instanceof Uint8Array)) {
		throw new EncryptionError('Ciphertext must be a Uint8Array', 'INVALID_CIPHERTEXT_TYPE');
	}
	
	if (ciphertext.length === 0) {
		throw new EncryptionError('Ciphertext cannot be empty', 'INVALID_CIPHERTEXT_SIZE');
	}
}

/**
 * Encrypts a payload using AES-GCM
 * 
 * @param key - AES key (must be 16, 24, or 32 bytes)
 * @param payload - Data to encrypt (must be JSON-serializable)
 * @returns Object containing the nonce and ciphertext
 * @throws {EncryptionError} If encryption fails or inputs are invalid
 * 
 * @example
 * ```typescript
 * const key = genKey();
 * const data = { message: 'Hello, World!' };
 * const { nonce, ciphertext } = encrypt(key, data);
 * ```
 * 
 * @security
 * - Never reuse the same key+nonce combination
 * - Store nonce alongside ciphertext (it's not secret)
 * - Keep keys secure and never expose them
 */
export const encrypt = <T>(
	key: Uint8Array,
	payload: T
): { nonce: Uint8Array; ciphertext: Uint8Array } => {
	try {
		// Validate inputs
		validateKey(key);
		validatePayload(payload);
		
		// Generate random nonce (12 bytes for AES-GCM)
		const nonce = randomBytes(12);
		
		// Create AES-GCM cipher
		const aes = gcm(key, nonce);
		
		// Serialize payload to JSON
		let payloadStr: string;
		try {
			payloadStr = JSON.stringify(payload);
		} catch (jsonError) {
			throw new EncryptionError(
				'Failed to serialize payload to JSON (check for circular references)',
				'SERIALIZATION_ERROR'
			);
		}
		
		// Encode to bytes and encrypt
		const data = new TextEncoder().encode(payloadStr);
		const ciphertext = aes.encrypt(data);
		
		return { nonce, ciphertext };
	} catch (error) {
		// Re-throw EncryptionError as-is
		if (error instanceof EncryptionError) {
			throw error;
		}
		
		// Wrap other errors to avoid information leakage
		throw new EncryptionError(
			'Encryption failed',
			'ENCRYPTION_ERROR'
		);
	}
};

/**
 * Decrypts a payload using AES-GCM
 * 
 * @param key - AES key (must match the key used for encryption)
 * @param nonce - Nonce used during encryption (12 bytes)
 * @param ciphertext - Encrypted data
 * @returns Decrypted payload
 * @throws {EncryptionError} If decryption fails, authentication fails, or inputs are invalid
 * 
 * @example
 * ```typescript
 * const key = genKey();
 * const { nonce, ciphertext } = encrypt(key, { message: 'Hello' });
 * const decrypted = decrypt(key, nonce, ciphertext);
 * ```
 * 
 * @security
 * - Authentication tag verification is automatic with AES-GCM
 * - Decryption failure may indicate tampering or wrong key
 * - Never ignore decryption errors
 */
export const decrypt = <T>(
	key: Uint8Array,
	nonce: Uint8Array,
	ciphertext: Uint8Array
): T => {
	try {
		// Validate inputs
		validateKey(key);
		validateNonce(nonce);
		validateCiphertext(ciphertext);
		
		// Create AES-GCM cipher
		const aes = gcm(key, nonce);
		
		// Decrypt (this will throw if authentication tag is invalid)
		let cleartext: Uint8Array;
		try {
			cleartext = aes.decrypt(ciphertext);
		} catch (decryptError) {
			// Authentication tag verification failed or decryption error
			throw new EncryptionError(
				'Decryption failed: data may be corrupted, tampered with, or wrong key used',
				'DECRYPTION_FAILED'
			);
		}
		
		// Decode bytes to string
		const decoded = new TextDecoder().decode(cleartext);
		
		// Parse JSON
		let object: unknown;
		try {
			object = JSON.parse(decoded);
		} catch (jsonError) {
			throw new EncryptionError(
				'Failed to parse decrypted data as JSON',
				'DESERIALIZATION_ERROR'
			);
		}
		
		// Validate that result is an object
		if (typeof object !== 'object' || object === null) {
			throw new EncryptionError(
				'Decrypted data is not a valid object',
				'INVALID_DECRYPTED_DATA'
			);
		}
		
		return object as T;
	} catch (error) {
		// Re-throw EncryptionError as-is
		if (error instanceof EncryptionError) {
			throw error;
		}
		
		// Wrap other errors to avoid information leakage
		throw new EncryptionError(
			'Decryption failed',
			'DECRYPTION_ERROR'
		);
	}
};

/**
 * Generates a cryptographically secure random AES-256 key
 * 
 * @returns 32-byte (256-bit) random key suitable for AES-256-GCM
 * 
 * @example
 * ```typescript
 * const key = genKey();
 * // Store key securely - never expose it or commit it to version control
 * ```
 * 
 * @security
 * - Uses cryptographically secure random number generator
 * - Returns AES-256 key (32 bytes)
 * - Store keys securely (e.g., encrypted at rest, in secure key management system)
 * - Never hardcode keys in source code
 * - Implement key rotation policies
 */
export const genKey = (): Uint8Array => {
	const key = randomBytes(32); // AES-256
	return key;
};

/**
 * Options for Argon2id key derivation
 */
export interface Argon2Options {
	/** Memory cost in KiB (default: 65536 = 64 MiB) */
	m?: number;
	/** Time cost / iterations (default: 3) */
	t?: number;
	/** Parallelism factor (default: 4) */
	p?: number;
	/** Output key length in bytes (default: 32 for AES-256) */
	dkLen?: number;
}

/**
 * Default Argon2id parameters (OWASP recommended for password hashing)
 * - Memory: 64 MiB (65536 KiB)
 * - Iterations: 3
 * - Parallelism: 4
 * - Output: 32 bytes (AES-256)
 */
const DEFAULT_ARGON2_OPTIONS: Required<Argon2Options> = {
	m: 65536, // 64 MiB
	t: 3,     // 3 iterations
	p: 4,     // 4 parallel threads
	dkLen: 32 // 32 bytes for AES-256
};

/**
 * Validates Argon2 parameters to prevent resource exhaustion attacks
 * @param options - Argon2 options to validate
 * @throws {EncryptionError} If parameters are invalid or unsafe
 */
function validateArgon2Options(options: Required<Argon2Options>): void {
	// Validate memory cost (m)
	if (!Number.isInteger(options.m) || options.m < 8) {
		throw new EncryptionError(
			'Memory cost (m) must be an integer >= 8 KiB',
			'INVALID_ARGON2_MEMORY'
		);
	}
	if (options.m > 2 ** 20) { // 1 GiB limit
		throw new EncryptionError(
			'Memory cost (m) must be <= 1048576 KiB (1 GiB)',
			'EXCESSIVE_ARGON2_MEMORY'
		);
	}
	
	// Validate time cost (t)
	if (!Number.isInteger(options.t) || options.t < 1) {
		throw new EncryptionError(
			'Time cost (t) must be an integer >= 1',
			'INVALID_ARGON2_TIME'
		);
	}
	if (options.t > 100) {
		throw new EncryptionError(
			'Time cost (t) must be <= 100 iterations',
			'EXCESSIVE_ARGON2_TIME'
		);
	}
	
	// Validate parallelism (p)
	if (!Number.isInteger(options.p) || options.p < 1) {
		throw new EncryptionError(
			'Parallelism (p) must be an integer >= 1',
			'INVALID_ARGON2_PARALLELISM'
		);
	}
	if (options.p > 256) {
		throw new EncryptionError(
			'Parallelism (p) must be <= 256',
			'EXCESSIVE_ARGON2_PARALLELISM'
		);
	}
	
	// Validate output length (dkLen)
	if (!Number.isInteger(options.dkLen) || options.dkLen < 16) {
		throw new EncryptionError(
			'Output length (dkLen) must be an integer >= 16 bytes',
			'INVALID_ARGON2_OUTPUT_LENGTH'
		);
	}
	if (options.dkLen > 1024) {
		throw new EncryptionError(
			'Output length (dkLen) must be <= 1024 bytes',
			'EXCESSIVE_ARGON2_OUTPUT_LENGTH'
		);
	}
}

/**
 * Derives a cryptographic key from a password using Argon2id
 * 
 * Argon2id is the recommended password hashing algorithm (winner of Password Hashing Competition 2015).
 * It provides resistance against:
 * - GPU cracking attacks
 * - Side-channel attacks
 * - Time-memory trade-off attacks
 * 
 * @param password - User password (string or Uint8Array)
 * @param salt - Cryptographic salt (must be at least 16 bytes, use genSalt())
 * @param options - Argon2id parameters (optional, uses secure defaults)
 * @returns Derived key suitable for AES encryption
 * @throws {EncryptionError} If inputs are invalid or KDF fails
 * 
 * @example
 * ```typescript
 * const password = 'user-password-123';
 * const salt = genSalt();
 * const key = deriveKey(password, salt);
 * 
 * // With custom parameters (higher security, slower)
 * const strongKey = deriveKey(password, salt, {
 *   m: 131072, // 128 MiB
 *   t: 4,      // 4 iterations
 *   p: 4       // 4 threads
 * });
 * ```
 * 
 * @security
 * - Always use a unique random salt per user/key (never reuse salts)
 * - Store salt alongside encrypted data (it's not secret)
 * - Use default parameters unless you have specific security requirements
 * - Higher parameters = more secure but slower (balance security vs UX)
 * - Never use user-provided values for Argon2 parameters (DoS risk)
 */
export const deriveKey = (
	password: string | Uint8Array,
	salt: Uint8Array,
	options: Argon2Options = {}
): Uint8Array => {
	try {
		// Validate password
		if (!password || (typeof password !== 'string' && !(password instanceof Uint8Array))) {
			throw new EncryptionError(
				'Password must be a non-empty string or Uint8Array',
				'INVALID_PASSWORD'
			);
		}
		
		// Convert string password to bytes
		const passwordBytes = typeof password === 'string' 
			? new TextEncoder().encode(password)
			: password;
		
		if (passwordBytes.length === 0) {
			throw new EncryptionError(
				'Password cannot be empty',
				'EMPTY_PASSWORD'
			);
		}
		
		// Validate salt
		if (!salt || !(salt instanceof Uint8Array)) {
			throw new EncryptionError(
				'Salt must be a Uint8Array',
				'INVALID_SALT_TYPE'
			);
		}
		
		if (salt.length < 16) {
			throw new EncryptionError(
				`Salt must be at least 16 bytes (got ${salt.length} bytes)`,
				'INVALID_SALT_SIZE'
			);
		}
		
		// Merge with defaults and validate
		const params: Required<Argon2Options> = {
			...DEFAULT_ARGON2_OPTIONS,
			...options
		};
		
		validateArgon2Options(params);
		
		// Derive key using Argon2id
		const derivedKey = argon2id(passwordBytes, salt, {
			m: params.m,
			t: params.t,
			p: params.p,
			dkLen: params.dkLen
		});
		
		return derivedKey;
	} catch (error) {
		// Re-throw EncryptionError as-is
		if (error instanceof EncryptionError) {
			throw error;
		}
		
		// Wrap other errors
		throw new EncryptionError(
			'Key derivation failed',
			'KDF_ERROR'
		);
	}
};

/**
 * Options for PBKDF2 key derivation
 */
export interface Pbkdf2Options {
	/** Number of iterations (default: 600000, OWASP 2023 recommendation for SHA-256) */
	iterations?: number;
	/** Hash algorithm (default: 'SHA-256') */
	hash?: 'SHA-256' | 'SHA-384' | 'SHA-512';
	/** Output key length in bytes (default: 32 for AES-256) */
	dkLen?: number;
}

/**
 * Default PBKDF2 parameters (OWASP 2023 recommended)
 */
const DEFAULT_PBKDF2_OPTIONS: Required<Pbkdf2Options> = {
	iterations: 600000,
	hash: 'SHA-256',
	dkLen: 32
};

/**
 * Derives a cryptographic key from a password using PBKDF2 via the Web Crypto API.
 * 
 * This is an async, non-blocking alternative to `deriveKey` (Argon2id).
 * It uses the browser's native `crypto.subtle` implementation which runs in
 * native code and does not block the UI thread.
 * 
 * @param password - User password (string or Uint8Array)
 * @param salt - Cryptographic salt (must be at least 16 bytes, use genSalt())
 * @param options - PBKDF2 parameters (optional, uses secure defaults)
 * @returns Derived key suitable for AES encryption
 * @throws {EncryptionError} If inputs are invalid or KDF fails
 * 
 * @example
 * ```typescript
 * const password = 'user-password-123';
 * const salt = genSalt();
 * const key = await deriveKeyAsync(password, salt);
 * ```
 * 
 * @security
 * - Uses PBKDF2-SHA256 with 600,000 iterations (OWASP 2023 recommendation)
 * - Non-blocking: runs via Web Crypto API in native code
 * - Always use a unique random salt per user/key
 */
export const deriveKeyAsync = async (
	password: string | Uint8Array,
	salt: Uint8Array,
	options: Pbkdf2Options = {}
): Promise<Uint8Array> => {
	try {
		// Validate password
		if (!password || (typeof password !== 'string' && !(password instanceof Uint8Array))) {
			throw new EncryptionError(
				'Password must be a non-empty string or Uint8Array',
				'INVALID_PASSWORD'
			);
		}

		// Convert string password to bytes
		const passwordBytes = typeof password === 'string'
			? new TextEncoder().encode(password)
			: password;

		if (passwordBytes.length === 0) {
			throw new EncryptionError(
				'Password cannot be empty',
				'EMPTY_PASSWORD'
			);
		}

		// Validate salt
		if (!salt || !(salt instanceof Uint8Array)) {
			throw new EncryptionError(
				'Salt must be a Uint8Array',
				'INVALID_SALT_TYPE'
			);
		}

		if (salt.length < 16) {
			throw new EncryptionError(
				`Salt must be at least 16 bytes (got ${salt.length} bytes)`,
				'INVALID_SALT_SIZE'
			);
		}

		// Merge with defaults
		const params: Required<Pbkdf2Options> = {
			...DEFAULT_PBKDF2_OPTIONS,
			...options
		};

		// Import password as a CryptoKey
		const keyMaterial = await crypto.subtle.importKey(
			'raw',
			passwordBytes.buffer as ArrayBuffer,
			'PBKDF2',
			false,
			['deriveBits']
		);

		// Derive bits using PBKDF2
		const derivedBits = await crypto.subtle.deriveBits(
			{
				name: 'PBKDF2',
				salt: salt.buffer as ArrayBuffer,
				iterations: params.iterations,
				hash: params.hash
			},
			keyMaterial,
			params.dkLen * 8 // deriveBits expects length in bits
		);

		return new Uint8Array(derivedBits);
	} catch (error) {
		// Re-throw EncryptionError as-is
		if (error instanceof EncryptionError) {
			throw error;
		}

		// Wrap other errors
		throw new EncryptionError(
			'Key derivation failed',
			'KDF_ERROR'
		);
	}
};

export const genSalt = (length: number = 32): Uint8Array => {
	if (!Number.isInteger(length) || length < 16) {
		throw new EncryptionError(
			'Salt length must be an integer >= 16 bytes',
			'INVALID_SALT_LENGTH'
		);
	}
	
	if (length > 256) {
		throw new EncryptionError(
			'Salt length must be <= 256 bytes',
			'EXCESSIVE_SALT_LENGTH'
		);
	}
	return randomBytes(length);
};
