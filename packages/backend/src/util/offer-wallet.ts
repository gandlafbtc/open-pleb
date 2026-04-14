import { initializeCoco, Manager, WebSocketFactory } from 'coco-cashu-core';
import { SqliteRepositories } from 'coco-sqlite-bun';
import { log } from './logger';
import Database from 'bun:sqlite';
import { mnemonicToSeed } from "@scure/bip39";
import { deriveNostrKeysFromSeed } from 'common/nostr-keys';
import { restoreOrCreateSession, ensureAuthSession } from 'common/auth';


/**
 * Creates a wallet manager for a specific offer
 * Each offer gets its own isolated wallet stored in SQLite
 */
export async function createOfferWallet(offerId: number): Promise<Manager> {
	// Construct absolute path and ensure directory exists
	const dbPath = `${Bun.env.OPENPLEB_WALLETS_DIR}/offer-${offerId}.db`	
	log.debug(`Creating offer wallet at: ${dbPath}`);
	
	// Create database connection
	const database = new Database(dbPath);
	
	// Create repositories
	const repositories = new SqliteRepositories({database});
	const webSocketFactory: WebSocketFactory = (url: string) => new WebSocket(url);
	// Create and return manager
	const manager = await initializeCoco({repo: repositories,  seedGetter: ()=> {return offerSeedGetter(offerId)}, webSocketFactory});
	
	log.info(`Created wallet for offer ${offerId}`);
	try {
		await manager.mint.addMint(Bun.env.OPENPLEB_MINT_URL!, {trusted:true})
		log.debug(`Mint added for offer ${offerId} wallet`);
		
		// Authenticate the wallet after adding the mint
		await createBackendAuthSession(manager);
		log.debug(`Auth session created for offer ${offerId} wallet`);
		
		// Ensure sufficient BATs for operations
		await ensureBackendAuthSession(manager, 50);
		log.debug(`Auth session ensured with sufficient BATs for offer ${offerId} wallet`);
	} catch (error) {
		console.error(error)
		log.error('{error}', {error})		
	}

	return manager;
}

const offerSeedGetter = async (offerId: number) => {
    return await mnemonicToSeed(Bun.env.OPENPLEB_CASHU_SEED_PHRASE!, offerId.toString())
}

/**
 * Claims an ecash token and verifies the amount
 * @param manager - The wallet manager instance
 * @param token - The ecash token to claim
 * @param expectedAmount - The expected amount in sats
 * @returns The actual amount received
 * @throws Error if amount doesn't match or claim fails
 */
export async function claimAndVerifyToken(
	manager: Manager,
	token: string,
	expectedAmount: number
): Promise<number> {
	try {
		// Claim the token
		const receiveOp = await manager.ops.receive.prepare({token});
		
		const finalized = await manager.ops.receive.execute(receiveOp);
		
        // check balance
        const receivedAmount = finalized.amount
		
		log.info(`Claimed token: expected ${expectedAmount}, received ${receivedAmount}`);
		
		// Verify amount matches
		if (receivedAmount !== expectedAmount) {
			throw new Error(
				`Amount mismatch: expected ${expectedAmount} sats, received ${receivedAmount} sats`
			);
		}
		
		return receivedAmount;
	} catch (error) {
		log.error(`Failed to claim token: ${error}`);
		throw error;
	}
}

/**
 * Gets the balance of an offer wallet
 */
export async function getOfferWalletBalance(manager: Manager): Promise<number> {
	const balance = await manager.wallet.getBalances();
	return balance[0];
}

/**
 * Gets the backend's main Nostr keys (not offer-specific)
 * These keys are used for authentication across all offers
 * @returns The private and public keys as Uint8Array
 */
export async function getBackendNostrKeys(): Promise<{
	privkey: Uint8Array;
	pubkey: Uint8Array;
}> {
	const seed = await mnemonicToSeed(Bun.env.OPENPLEB_CASHU_SEED_PHRASE!);
	return deriveNostrKeysFromSeed(seed);
}

/**
 * Creates or restores an auth session using the backend's main identity
 * This session is shared across all offers
 * @param manager - The wallet manager instance
 * @returns The auth session
 */
export async function createBackendAuthSession(manager: Manager) {
	const mintUrl = Bun.env.OPENPLEB_MINT_URL!;
	const keys = await getBackendNostrKeys();
	return await restoreOrCreateSession(manager, mintUrl, keys.privkey);
}

/**
 * Ensures a valid auth session exists with sufficient BAT balance
 * Uses the backend's main identity, shared across all offers
 * @param manager - The wallet manager instance
 * @param targetBatCount - The target number of BATs to ensure (default: 50)
 * @returns The auth session
 */
export async function ensureBackendAuthSession(
	manager: Manager,
	targetBatCount: number = 50
) {
	const mintUrl = Bun.env.OPENPLEB_MINT_URL!;
	const keys = await getBackendNostrKeys();
	return await ensureAuthSession(manager, mintUrl, keys.privkey, targetBatCount);
}
