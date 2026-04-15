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
import { blindSessionService } from "$lib/interface/rest/blindSession.service";
import { offerService } from "$lib/interface/rest/offer.service";
import { offerListService } from "$lib/interface/rest/offerList.service";
import { providerService } from "$lib/interface/rest/provider.service";
import { sessionCountService } from "$lib/interface/rest/sessionCount.service";

export const init = async () => {
	await key.initKeyFromPass(new TextEncoder().encode(DEFAULT_PASS))
	await initStores()
	await blindSessionService.init()
	await offerService.init()
	await offerListService.init()
	await providerService.init()
	await sessionCountService.init()
	afterInit()
};

const afterInit = () => {
	
}

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