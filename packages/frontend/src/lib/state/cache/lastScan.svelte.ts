class LastScan {
    private _scan: string = $state("");
    constructor() {
    }

    public set scan(scan: string) {
        this._scan = scan
        setTimeout(() => {
            this._scan = ""
        }, 1000);
    }

    public get scan() {
        return this._scan
    }
}


export const lastScan = new LastScan()
