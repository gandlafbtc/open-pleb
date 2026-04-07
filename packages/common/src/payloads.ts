import { schnorr } from "@noble/curves/secp256k1.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";

export const signPayload = <T extends object>(payload: T, privateKey: string): {payload: T}&{signature: string, nonce: string, timestamp: number} => {
    const sorted = sortObjectByKeys(payload);
    const nonce = bytesToHex(schnorr.utils.randomSecretKey());
    const timestamp = Date.now();
    const message = nonce + timestamp + JSON.stringify(sorted);
    const encoder = new TextEncoder();
    const messageHash = sha256(encoder.encode(message));
    const privKeyBytes = hexToBytes(privateKey);
    const signature = bytesToHex(schnorr.sign(messageHash, privKeyBytes));
    return {payload: sorted, signature, nonce, timestamp};
};

export const verifyPayload = (payload: object, signature: string, nonce: string, timestamp: number, publicKey: string): boolean => {
    const currentTime = Date.now(); 
    if (currentTime - timestamp > 60 * 1000) { // 1 minute
        return false; 
    }
    const sorted = sortObjectByKeys(payload);
    const message = nonce + timestamp + JSON.stringify(sorted);
    const encoder = new TextEncoder();
    const messageHash = sha256(encoder.encode(message));
    const pubKeyBytes = hexToBytes(publicKey);
    const sigBytes = hexToBytes(signature);
    return schnorr.verify(sigBytes, messageHash, pubKeyBytes); 
}

export const sortObjectByKeys = <T extends object>(obj: T): T => {
    const sortedKeys = Object.keys(obj).sort();
    const sortedObj = {} as T;
    for (const key of sortedKeys) {
          sortedObj[key as keyof T] = obj[key as keyof T];        
    }
    return sortedObj;
}