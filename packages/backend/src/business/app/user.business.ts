import * as repo from "../../repository/app/user.repository"

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

    if(!(await repo.verifyInviteCode(inviteCode))){
        return false
    }

    return true
}

export const isUserInvited = async (pubkey:string) =>{
    if (!isValidPubkey(pubkey)) {
        throw new Error("Invalid pubkey. Should be 64 hex char, got: "+pubkey);
    }
    return await repo.isUserInvited(pubkey)
}

export const registerUser = async (pubkey:string, inviteCode:string) => {
    if (!isValidPubkey(pubkey)) {
        throw new Error("Invalid pubkey. Should be 64 hex char, got: "+pubkey);
    }

    if (!isValidInviteCode(inviteCode)) {
        throw new Error("Invalid invite code.");
    }

    return await repo.registerUser(pubkey, inviteCode)
}
