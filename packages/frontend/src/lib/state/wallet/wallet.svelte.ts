import { initializeCoco, Manager, type AuthSession, type HistoryEntry, type Mint, } from 'coco-cashu-core';
import { IndexedDbRepositories } from 'coco-cashu-indexeddb';
import { seed } from '../dynamic/seed.svelte';
import { finalizeEvent, type EventTemplate, type VerifiedEvent } from "@nostr/tools";
import { getOriginFromUrl, getUnixNow } from 'common/util';
import { idKeys } from '../dynamic/id.svelte';
import { SvelteSet } from 'svelte/reactivity';
import { type Proof } from '@cashu/cashu-ts';


export class CocoWallet {
    private static instance: CocoWallet | null = null;
    private coco: Manager;
    private _balance: number = $state(0);
    private _history: HistoryEntry[] = $state([]);
    private _mint: Mint | undefined = $state();
    private _batsBalance: number = $state(0)
    private _loginSession: AuthSession | undefined = $state()
    private batsDeltaListeners: SvelteSet<(delta: number) => void> = new SvelteSet();
    private balanceDeltaListeners: SvelteSet<(delta: number) => void> = new SvelteSet();

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
        coco.on('proofs:saved', () => this.refreshBalance(coco));
        coco.on('proofs:state-changed', () => this.refreshBalance(coco));
        coco.on('proofs:deleted', () => this.refreshBalance(coco));
        coco.on('proofs:reserved', () => this.refreshBalance(coco));
        coco.on('proofs:released', () => this.refreshBalance(coco));
        coco.on("history:updated", () => this.refreshHistory(coco))
        coco.on("history:updated", () => this.refreshBatBalance(coco))
    }

    async refreshBatBalance(coco: Manager) {
        if (!this.mint)  {
            throw new Error("Mint not initialized yet");
        }
        const oldBalance = this._batsBalance
        this._batsBalance = await this.coco.auth.getPoolSize(this.mint.mintUrl)

        const delta = this.batsBalance - oldBalance
        if (delta !== 0) {
            this.emitBatsDelta(delta);
        }
    }

    async consumeBat(): Promise<Proof> {
        if (!this.mint)  {
            throw new Error("Mint not initialized yet");
        }
        const bat = await this.coco.auth.consumeBat(this.mint?.mintUrl, true)
        this.refreshBatBalance(this.coco)
        if (!bat) {
            throw new Error("No BAT found in BATpool")
        }
        return bat
    }

    onBatsDelta(listener: (delta: number) => void): () => void {
        this.batsDeltaListeners.add(listener);
        // Return unsubscribe function
        return () => {
            this.batsDeltaListeners.delete(listener);
        };
    }

    private emitBatsDelta(delta: number) {
        this.batsDeltaListeners.forEach(listener => listener(delta));
    }

    onBalanceDelta(listener: (delta: number) => void): () => void {
        this.balanceDeltaListeners.add(listener);
        // Return unsubscribe function
        return () => {
            this.balanceDeltaListeners.delete(listener);
        };
    }

    private emitBalanceDelta(delta: number) {
        this.balanceDeltaListeners.forEach(listener => listener(delta));
    }

    // In CocoWallet class
    async waitForHistoryUpdate(): Promise<void> {
        return new Promise((resolve) => {
            const handler = () => {
                this.coco.off('history:updated', handler);
                resolve();
            };
            this.coco.on('history:updated', handler);
            // Add timeout as safety
            setTimeout(() => {
                this.coco.off('history:updated', handler);
                resolve();
            }, 100);
        });
    }

    async createLoginSession() {
        if (!this.mint) {
            throw new Error("Mint not initialized yet");
        }
        
        try {
            const isSuccess = await this.coco.auth.restore(this.mint.mintUrl)
            
            if (isSuccess) {
                // Check if the restored session is still valid
                const session = await this.coco.auth.getSession(this.mint.mintUrl)
                if (session && session.expiresAt < getUnixNow()) {
                    console.log('Using existing valid session, expires at:', session.expiresAt)
                    console.log('current time:', session.expiresAt<getUnixNow())
                    return session
                }
                console.log('Session expired or invalid, creating new one')
            }
        } catch (error) {
            console.log('Failed to restore session, creating new one:', error)
        }
        
        // If restore failed or session is expired, create a new one
        return await this.createClearAuthSession()
    }

    async refreshAuthSession() {
        if (!this.mint) {
            throw new Error("Mint not initialized yet");
        }
        // Ensure we have a valid session first and store it
        this.loginSession = await this.createLoginSession();
        
        const provider = await this.coco.auth.getAuthProvider(this.mint.mintUrl)
        if (!provider) {
            throw new Error("Could not get provider");
        }
        await provider.ensure?.(50)
        this.loginSession = await this.coco.auth.getSession(this.mint.mintUrl)
        await this.refreshBatBalance(this.coco)

    }



    private async createClearAuthSession() {
        if (!this.mint) {
            throw new Error("Mint not initialized yet");
        }
        console.log("deviceAuth")
        const deviceAuth = await this.coco.auth.startDeviceAuth(this.mint.mintUrl)

        const code = deviceAuth.user_code.replaceAll("-", "")
        const origin = getOriginFromUrl(deviceAuth.verification_uri)

        const event: EventTemplate =

        {
            "kind": 22242,
            "created_at": getUnixNow(),
            "tags": [
                [
                    "user_code",
                    code
                ],
                [
                    "purpose",
                    "device_auth"
                ],
                [
                    "relay",
                    origin
                ]
            ],
            "content": `Authorize device with code ${code}`
        }
        const signedEvent: VerifiedEvent = finalizeEvent(event, idKeys.privkey)
        const formData = new FormData();
        formData.append('user_code', code);
        formData.append('event', JSON.stringify(signedEvent));

        await fetch(origin + "/device?/approve=", {
            method: "POST",
            body: formData
        })

        let pollResult

        do {
            const res = await deviceAuth.poll()
            if (res?.access_token) {
                pollResult = res
            }
        } while (!pollResult)
        console.log('authed')
        return await this.coco.auth.login(this.mint.mintUrl, { access_token: pollResult.access_token! })
    }

    async receiveLn(amount: number) {
        if (!this.mint) {
            throw new Error("Mint not initialized yet");
        }
        const quote = await this.coco.ops.mint.prepare({
            amount,
            method: "bolt11",
            mintUrl: this.mint.mintUrl
        })
        return quote
    }

    async sendEcash(amount: number) {
        if (!this.mint) {
            throw new Error("Mint not initialized yet");
        }
        const result = await this.coco.ops.send.prepare({ amount, mintUrl: this.mint.mintUrl });
        const executed = await this.coco.ops.send.execute(result)
        return executed;
    }

    async sendLn(invoice: string) {
        if (!this.mint) {
            throw new Error("Mint not initialized yet");
        }
        // Create melt quote
        const operation = await this.coco.ops.melt.prepare({ method: "bolt11", mintUrl: this.mint.mintUrl, methodData: { invoice } });
        // Execute melt (pay the invoice)
        const result = await this.coco.ops.melt.execute(operation)
        return result;
    }

    async receiveEcash(token: string) {
        const result = await this.coco.wallet.receive(token);
        return result;
    }

    async refreshBalance(coco: Manager) {
        try {
            const oldBalance = this._balance;
            const bal = await coco.wallet.getBalances();
            const total = Object.values(bal || {}).reduce<number>((acc, cur) => acc + (cur as number), 0);
            this.balance = total;
            
            const delta = this.balance - oldBalance;
            if (delta !== 0) {
                this.emitBalanceDelta(delta);
            }
        } catch (error) {
            console.error(error);
        }
    }
    async refreshHistory(coco: Manager) {
        try {
            const history = await coco.history.getPaginatedHistory(0, 9999);
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

    private set batsBalance(balance: number) {
        this._batsBalance = balance
    }

    get batsBalance() {
        return this._batsBalance
    }

    private set history(history: HistoryEntry[]) {
        this._history = history
    }

    get history() {
        return this._history
    }

    private set mint(mint: Mint | undefined) {
        this._mint = mint
    }

    get mint() {
        return this._mint
    }


    private set loginSession(session: AuthSession | undefined) {
        this._loginSession = session
    }

    get loginSession() {
        return this._loginSession
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
        const mints = await this.coco.mint.getAllTrustedMints()
        const m = mints.find(m => m.mintUrl === url)
        if (m) {
            this.mint = m
        }
        else {
            const { mint } = await this.coco.mint.addMint(url, { trusted: true })
            this.mint = mint
        }
        try {
            await this.coco.auth.restore(this.mint.mintUrl)
            this._loginSession = await this.coco.auth.getSession(this.mint.mintUrl)
            await this.refreshBatBalance(this.coco)
        } catch (error) {
            console.log("could not restore auth session:", error)            
        }
    }
}


export const wallet = await CocoWallet.getInstance();
