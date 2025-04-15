import { get } from 'svelte/store';
import { key } from './stores/session/key';
import { dataStore } from './stores/session/data';
import { reconnectWebSocket } from './stores/ws';
import { lnurlStore } from './stores/persistent/lnurl';

export const init = async () => {
	await key.init();
	await initStores();
	await initData();
};

const initData = async () => {
	await dataStore.init();
	await reconnectWebSocket();
};

const initStores = async () => {
	await lnurlStore.init();
};

export const reencrypt = async () => {
	await lnurlStore.reEncrypt();
};
