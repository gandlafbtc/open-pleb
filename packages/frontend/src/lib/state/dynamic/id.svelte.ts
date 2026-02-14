import { HDKey } from "@scure/bip32";
import { seed } from "./seed.svelte";
import { schnorr } from "@noble/curves/secp256k1.js";
import { bytesToHex } from "@noble/ciphers/utils.js";
import { bech32 } from "@scure/base";
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
        const hdKey = HDKey.fromMasterSeed(seed.seed)
        const privkey = hdKey.derive("m/44'/1237'/0'/0/0")
        if (!privkey.privateKey) {
            throw new Error("Could not get key from seed")
        }
        this.privkey = privkey.privateKey
        this.pubkey = schnorr.getPublicKey(this.privkey)
    }

    getNpub() {
        if (!this.pubkey) {
            throw new Error("Could not get pubkey: pubkey not set")
        }
        const words = bech32.toWords(this.pubkey);
        return bech32.encode("npub", words);
    }
    getHexPubKey() {
        if (!this.pubkey) {
            throw new Error("Could not get pubkey: pubkey not set")
        }
        return bytesToHex(this.pubkey)
    }
};

export const idKeys = new IDKeys();
