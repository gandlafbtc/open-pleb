import { get } from 'svelte/store';
import { keysStore } from './stores/persistent/keys';
import { key } from './stores/session/key';
import { dataStore } from './stores/session/data';
import { reconnectWebSocket } from './stores/ws';

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
	await keysStore.init();
};

export const reencrypt = async () => {
	await keysStore.reEncrypt();
};
