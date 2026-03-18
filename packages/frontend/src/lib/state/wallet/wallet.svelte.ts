import { initializeCoco, Manager, type HistoryEntry, type Mint } from 'coco-cashu-core';
import { IndexedDbRepositories } from 'coco-cashu-indexeddb';
import { seed } from '../dynamic/seed.svelte';
export class CocoWallet {
    private static instance: CocoWallet | null = null;
    private coco: Manager;
    private _balance: number = $state(0);
    private _history: HistoryEntry[]  = $state([]);
    private _mint: Mint | undefined  = $state();

    private constructor(coco: Manager) {
        // Private constructor to prevent direct instantiation
        this.coco = coco;
        this.refreshBalance(coco)
        this.refreshHistory(coco)
    }

    static async getInstance(): Promise<CocoWallet> {
        if (!CocoWallet.instance) {
            const coco = await CocoWallet.init();
            CocoWallet.instance = new CocoWallet(coco);
            CocoWallet.instance.registerListeners(CocoWallet.instance.coco)
        }
        return CocoWallet.instance;
    }

    private registerListeners(coco: Manager) {
        coco.on('proofs:saved', ()=> this.refreshBalance(coco));
        coco.on('proofs:state-changed', ()=> this.refreshBalance(coco));
        coco.on('proofs:deleted', ()=> this.refreshBalance(coco));
        coco.on('proofs:reserved', ()=> this.refreshBalance(coco));
        coco.on('proofs:released', ()=> this.refreshBalance(coco));
        coco.on("history:updated", ()=> this.refreshHistory(coco))
    }

    

    async receiveLn(amount: number) {
        if (!this.mint) {
            throw new Error("Mint not initialized yet");
        }
        const quote = await this.coco.quotes.createMintQuote(this.mint.mintUrl, amount)
        return quote
    }

    async refreshBalance(coco: Manager) {
        try {
            const bal = await coco.wallet.getBalances();
            const total = Object.values(bal || {}).reduce<number>((acc, cur) => acc + (cur as number), 0);
            this.balance = total;
        } catch (error) {
            console.error(error);
        }
    }
        async refreshHistory(coco: Manager) {
        try {
            const history = await coco.history.getPaginatedHistory();
            this.history = history;
        } catch (error) {
            console.error(error);
        }
    }

    private set balance(balance: number) {
        this._balance = balance
    }

    get balance() {
        return this._balance
    }

    private set history(history: HistoryEntry[]) {
        this._history = history
    }

    get history() {
        return this._history
    }

    private set mint(mint: Mint|undefined) {
        this._mint = mint
    }

    get mint() {
        return this._mint
    }


    private static async init() {
        const repo = new IndexedDbRepositories({ name: 'coco' });
        const manager = await initializeCoco({
            repo, seedGetter: async () => {
                if (!seed.seed) {
                    throw new Error("Tried to initialize wallet before seed");
                }
                return Promise.resolve(seed.seed)
            }
        })
        return manager
    }
    async initMint(url: string) {
        console.log()
        const mints = await this.coco.mint.getAllTrustedMints()
        const m = mints.find(m=> m.mintUrl===url)
        if (m) {
            this.mint = m
        }
        else {
            const {mint} = await this.coco.mint.addMint(url,{trusted:true})
            this.mint = mint
        }
    }
}


export const wallet = await CocoWallet.getInstance();
