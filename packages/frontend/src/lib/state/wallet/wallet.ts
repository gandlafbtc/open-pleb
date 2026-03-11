import { initializeCoco, Manager } from 'coco-cashu-core';
import { IndexedDbRepositories } from 'coco-cashu-indexeddb';
import { seed } from '../dynamic/seed.svelte';
class CocoWallet {
    private static instance: CocoWallet | null = null;
    private coco: Manager | null = null;
    private _balance: number = 0

    private constructor() {
        // Private constructor to prevent direct instantiation
        
    }
    
    static async getInstance(): Promise<CocoWallet> {
        if (!CocoWallet.instance) {
            CocoWallet.instance = new CocoWallet();
            CocoWallet.instance.coco = await CocoWallet.init();
            CocoWallet.instance.registerListeners(CocoWallet.instance.coco)
        }
        return CocoWallet.instance;
    }

    private registerListeners(coco: Manager) {
        coco.on('proofs:saved', this.refresh);
        coco.on('proofs:state-changed', this.refresh);
        coco.on('proofs:deleted', this.refresh);
        coco.on('proofs:reserved', this.refresh);
        coco.on('proofs:released', this.refresh);
    }
  async refresh() {
    try {
      const bal = await this.coco!.wallet.getBalances();
      const total = Object.values(bal || {}).reduce<number>((acc, cur) => acc + (cur as number), 0);
      this.balance = total;
    } catch (error) {
      console.error(error);
    }
  }

    private set balance (balance: number) {
        this._balance = balance
    }

    get balance () {
        return this._balance
    }
    

    private static async init() {
        const repo = new IndexedDbRepositories({ name: 'coco' });
        return await initializeCoco({
            repo, seedGetter: async () => {
                if (!seed.seed) {
                    throw new Error("Tried to initialize wallet before seed");
                }
                return Promise.resolve(seed.seed)
            }
        })
    }

}


export const wallet = await CocoWallet.getInstance();
