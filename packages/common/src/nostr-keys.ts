import { HDKey } from "@scure/bip32";
import { schnorr } from "@noble/curves/secp256k1.js";
import { bytesToHex } from "@noble/ciphers/utils.js";
import { bech32 } from "@scure/base";

/**
 * Derives Nostr keys from a seed using BIP32 path m/44'/1237'/0'/0/0
 * @param seed - The master seed (Uint8Array)
 * @returns Object containing private key (Uint8Array) and public key (Uint8Array)
 */
export function deriveNostrKeysFromSeed(seed: Uint8Array): {
    privkey: Uint8Array;
    pubkey: Uint8Array;
} {
    const hdKey = HDKey.fromMasterSeed(seed);
    const derivedKey = hdKey.derive("m/44'/1237'/0'/0/0");
    
    if (!derivedKey.privateKey) {
        throw new Error("Could not derive private key from seed");
    }
    
    const privkeyBytes = derivedKey.privateKey;
    const pubkeyBytes = schnorr.getPublicKey(privkeyBytes);
    
    return {
        privkey: privkeyBytes,
        pubkey: pubkeyBytes
    };
}

/**
 * Converts a Uint8Array public key to npub format
 * @param pubkey - The public key as Uint8Array
 * @returns The npub (bech32 encoded public key)
 */
export function pubkeyToNpub(pubkey: Uint8Array): string {
    const words = bech32.toWords(pubkey);
    return bech32.encode("npub", words);
}

