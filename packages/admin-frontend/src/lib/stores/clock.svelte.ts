import { writable } from "svelte/store"

export const clock = createClock()

function createClock() {
    const store = writable(getTime())
    setInterval(() => {
        store.set(getTime())
    }, 1000)
    return store
}

function getTime() {
	return Math.floor(Date.now()/1000)
}
