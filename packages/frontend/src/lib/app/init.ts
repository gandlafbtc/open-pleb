import { idKeys } from "$lib/state/dynamic/id.svelte";
import { key } from "$lib/state/dynamic/key.svelte";
import { seed } from "$lib/state/dynamic/seed.svelte";
import { env } from "$lib/state/dynamic/env.svelte";
import { exchangeRate } from "$lib/state/dynamic/exchangerate.svelte";
import { backendUrl } from "$lib/state/dynamic/backendUrl.svelte";
import { lnurl } from "$lib/state/persistent/db/repos/lnurl";
import { seedPhrase } from "$lib/state/persistent/db/repos/seedPhrase";
import { settings } from "$lib/state/persistent/db/repos/settings";
import { DEFAULT_PASS } from "$lib/state/static/pass";

export const init = async () => {
	await key.initKeyFromPass(new TextEncoder().encode(DEFAULT_PASS))
	await initStores()
};

const initStores = async () => {
	await settings.init()
	backendUrl.init() // must run after settings.init
	await env.init()
	await exchangeRate.init()
	await lnurl.init()
	await seedPhrase.init()
	if (seedPhrase.data.length) {
		// must run after seedPhrase.init
		await initSeedAndKeys()	
	}
}

export const initSeedAndKeys = async () => {
	await seed.initSeedFromSeedPhrase()
	// must run after seed.init
	idKeys.initKeysFromSeed()
}