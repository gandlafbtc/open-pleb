import { idKeys } from "$lib/state/dynamic/id.svelte";
import { key } from "$lib/state/dynamic/key.svelte";
import { seed } from "$lib/state/dynamic/seed.svelte";
import { lnurl } from "$lib/state/persistent/db/repos/lnurl";
import { seedPhrase } from "$lib/state/persistent/db/repos/seedPhrase";
import { DEFAULT_PASS } from "$lib/state/static/pass";

export const init = async () => {
	await key.initKeyFromPass(new TextEncoder().encode(DEFAULT_PASS))
	await initStores()
};

const initStores = async () => {
	await lnurl.init()
	await seedPhrase.init()
	// must run after seedPhrase.init
	await seed.initSeedFromSeedPhrase()
	// must run after seed.init
	idKeys.initKeysFromSeed()
}