import type { Manager, AuthSession } from 'coco-cashu-core';
import { finalizeEvent, type EventTemplate, type VerifiedEvent } from "@nostr/tools";
import { getOriginFromUrl, getUnixNow } from './util';

/**
 * Creates a new authentication session using device auth flow with Nostr signing
 * @param manager - The coco Manager instance
 * @param mintUrl - The mint URL to authenticate with
 * @param signingKey - The Nostr private key (Uint8Array) to sign the auth event
 * @returns The created AuthSession
 */
export async function createDeviceAuthSession(
    manager: Manager,
    mintUrl: string,
    signingKey: Uint8Array
): Promise<AuthSession> {
    console.log("Starting device auth");
    const deviceAuth = await manager.auth.startDeviceAuth(mintUrl);

    const code = deviceAuth.user_code.replaceAll("-", "");
    const origin = getOriginFromUrl(deviceAuth.verification_uri);

    const event: EventTemplate = {
        "kind": 22242,
        "created_at": getUnixNow(),
        "tags": [
            [
                "user_code",
                code
            ],
            [
                "purpose",
                "device_auth"
            ],
            [
                "relay",
                origin
            ]
        ],
        "content": `Authorize device with code ${code}`
    };
    
    const signedEvent: VerifiedEvent = finalizeEvent(event, signingKey);
    const formData = new FormData();
    formData.append('user_code', code);
    formData.append('event', JSON.stringify(signedEvent));

    await fetch(origin + "/device?/approve=", {
        method: "POST",
        body: formData
    });

    let pollResult;

    do {
        const res = await deviceAuth.poll();
        if (res?.access_token) {
            pollResult = res;
        }
    } while (!pollResult);
    
    console.log('Device authenticated');
    return await manager.auth.login(mintUrl, { access_token: pollResult.access_token! });
}

/**
 * Attempts to restore an existing session, or creates a new one if restoration fails
 * @param manager - The coco Manager instance
 * @param mintUrl - The mint URL to authenticate with
 * @param signingKey - The Nostr private key (Uint8Array) to sign the auth event if new session is needed
 * @returns The restored or newly created AuthSession
 */
export async function restoreOrCreateSession(
    manager: Manager,
    mintUrl: string,
    signingKey: Uint8Array
): Promise<AuthSession> {
    try {
        const isSuccess = await manager.auth.restore(mintUrl);
        
        if (isSuccess) {
            // Check if the restored session is still valid
            const session = await manager.auth.getSession(mintUrl);
            if (session && session.expiresAt > getUnixNow()) {
                // TODO something is wrong with detecting the expiry. needs investigation. 
                // for now, we always create a new session.
                // return session;
            }
        }
    } catch (error) {
        console.error('Failed to restore session, creating new one:', error);
    }
    
    // If restore failed or session is expired, create a new one
    return await createDeviceAuthSession(manager, mintUrl, signingKey);
}

/**
 * Ensures a valid authentication session exists and refreshes the BAT pool
 * @param manager - The coco Manager instance
 * @param mintUrl - The mint URL to authenticate with
 * @param signingKey - The Nostr private key (Uint8Array) to sign the auth event if new session is needed
 * @param targetBatCount - The target number of BATs to ensure in the pool (default: 50)
 * @returns The current AuthSession
 */
export async function ensureAuthSession(
    manager: Manager,
    mintUrl: string,
    signingKey: Uint8Array,
    targetBatCount: number = 50
): Promise<AuthSession> {
    // Ensure we have a valid session first
    const session = await restoreOrCreateSession(manager, mintUrl, signingKey);
    
    const provider = await manager.auth.getAuthProvider(mintUrl);
    if (!provider) {
        throw new Error("Could not get auth provider");
    }
    
    await provider.ensure?.(targetBatCount);
    
    // Get the updated session after ensuring BATs
    const updatedSession = await manager.auth.getSession(mintUrl);
    if (!updatedSession) {
        throw new Error("Session not found after ensuring BATs");
    }
    
    return updatedSession;
}
