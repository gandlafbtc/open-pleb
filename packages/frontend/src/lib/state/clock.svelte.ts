import { getUnixNow } from "common/util";

class Clock {
    private _time: number = $state(getUnixNow());
    constructor() {
        setInterval(()=> {
            this._time=getUnixNow()
        }, 1000)
    }

    private set time(time: number) {
        this._time = time
    }

    public get time() {
        return this._time
    }
}


export const clock = new Clock()
