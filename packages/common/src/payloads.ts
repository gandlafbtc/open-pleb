import { schnorr } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha2";
import { bytesToHex } from "@noble/hashes/utils";

export const signPayload = <T extends object>(payload: T, privateKey: string): {payload: T}&{signature: string, nonce: string, timestamp: number} => {
    const sorted = sortObjectByKeys(payload);
    const nonce = bytesToHex(schnorr.utils.randomPrivateKey());
    const timestamp = Date.now();
    const message = nonce + timestamp + JSON.stringify(sorted);
    const messageHash = sha256(message);
    const signature = bytesToHex(schnorr.sign(messageHash, privateKey));
    return {payload: sorted, signature, nonce, timestamp};
};

export const verifyPayload = (payload: object, signature: string, nonce: string, timestamp: number, publicKey: string): boolean => {
    const currentTime = Date.now(); 
    if (currentTime - timestamp > 60 * 1000) { // 1 minute
        return false; 
    }
    const sorted = sortObjectByKeys(payload);
    const message = nonce + timestamp + JSON.stringify(sorted);
    const messageHash = sha256(message);
    return schnorr.verify(signature, messageHash, publicKey); 
}

export const sortObjectByKeys = <T extends object>(obj: T): T => {
    const sortedKeys = Object.keys(obj).sort();
    const sortedObj = {} as T;
    for (const key of sortedKeys) {
          sortedObj[key as keyof T] = obj[key as keyof T];        
    }
    return sortedObj;
  }