import { seedPhrase } from "../persistent/db/repos/seedPhrase";
import { mnemonicToSeed } from "@scure/bip39";

class Seed {
    private _seed: Uint8Array | undefined;
    constructor () {
    }
    public get seed() : Uint8Array | undefined {
        return this._seed
    }
    
    public set seed(v : Uint8Array) {
        this._seed = v;
    }

    public async initSeedFromSeedPhrase() {
        if (seedPhrase.data[0]) {
            this.seed = await mnemonicToSeed(seedPhrase.data[0].seedPhrase)
        }
        else {
            throw new Error("Could not init seed: No seed phrase set.")
        }
    }
};

export const seed = new Seed();
