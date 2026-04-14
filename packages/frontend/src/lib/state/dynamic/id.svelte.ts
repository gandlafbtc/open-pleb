import { seed } from "./seed.svelte";
import { deriveNostrKeysFromSeed, pubkeyToNpub } from "common/nostr-keys";
import { bytesToHex } from "@noble/ciphers/utils.js";
class IDKeys {
    private _pubkey: Uint8Array | undefined = $state();
    private _privkey: Uint8Array | undefined = $state();
    constructor() {
    }
    public get pubkey(): Uint8Array | undefined {
        return this._pubkey
    }

    public set pubkey(v: Uint8Array) {
        this._pubkey = v;
    }

    public get privkey(): Uint8Array | undefined {
        return this._privkey
    }

    public set privkey(v: Uint8Array) {
        this._privkey = v;
    }

    initKeysFromSeed() {
        if (!seed.seed) {
            throw new Error("Could not init ID keys: No seed set.")
        }
        const keys = deriveNostrKeysFromSeed(seed.seed);
        this.privkey = keys.privkey;
        this.pubkey = keys.pubkey;
    }

    getNpub() {
        if (!this.pubkey) {
            throw new Error("Could not get pubkey: pubkey not set")
        }
        return pubkeyToNpub(this.pubkey);
    }
    getHexPubKey() {
        if (!this.pubkey) {
            throw new Error("Could not get pubkey: pubkey not set")
        }
        return bytesToHex(this.pubkey);
    }
};

export const idKeys = new IDKeys();
