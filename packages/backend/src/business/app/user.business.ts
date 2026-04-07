import { pubkeyToNpub } from "common/encoding"
import * as repo from "../../repository/app/user.repository"
import { hexToBytes } from "@noble/hashes/utils.js"

/**
 * Validates that a pubkey is exactly 64 hexadecimal characters
 * @param pubkey - The public key to validate
 * @returns true if valid, false otherwise
 */
const isValidPubkey = (pubkey: string): boolean => {
    if (!pubkey || typeof pubkey !== 'string') {
        return false
    }
    // Check if it's exactly 64 characters and all are valid hex characters (0-9, a-f, A-F)
    const hexRegex = /^[0-9a-fA-F]{64}$/
    return hexRegex.test(pubkey)
}

/**
 * Validates that an invite code is exactly 32 hexadecimal characters
 * @param inviteCode - The invite code to validate
 * @returns true if valid, false otherwise
 */
const isValidInviteCode = async (inviteCode: string): Promise<boolean> => {
    if (!inviteCode || typeof inviteCode !== 'string') {
        return false
    }
    // Check if it's exactly 32 characters and all are valid hex characters (0-9, a-f, A-F)
    const hexRegex = /^[0-9a-fA-F]{32}$/

    if (!hexRegex.test(inviteCode)) {
        return false
    }

    if (!(await repo.verifyInviteCode(inviteCode))) {
        return false
    }

    return true
}

export const isUserInvited = async (pubkey: string) => {
    if (!isValidPubkey(pubkey)) {
        throw new Error("Invalid pubkey. Should be 64 hex char, got: " + pubkey);
    }
    return await repo.isUserInvited(pubkey)
}

export const registerUser = async (pubkey: string, inviteCode: string) => {
    if (!isValidPubkey(pubkey)) {
        throw new Error("Invalid pubkey. Should be 64 hex char, got: " + pubkey);
    }

    if (!await isValidInviteCode(inviteCode)) {
        throw new Error("Invalid invite code.");
    }

    if (await repo.isUserInvited(pubkey)) {
        throw new Error("User already invited.");
    }

    const isRegisteredUser = await repo.registerUser(pubkey, inviteCode)
    if (isRegisteredUser) {
        const res = await fetch(`${Bun.env.OPENPLEB_NOSTR_OIDC_HOST}/api/admin/users`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${Bun.env.OPENPLEB_NOSTR_OIDC_ADMIN_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                    npub: pubkeyToNpub(hexToBytes(pubkey)),
                    preferredLanguage: 'en',
                    isAdmin: false,
                    active: true
            })
        })
        if (!res.ok) {
            throw new Error(`error ${res.status} when creating user on oidc service: ${await res.text()}`);
        }
        
    }
    return
}
