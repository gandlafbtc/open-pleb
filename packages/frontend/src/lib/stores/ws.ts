import { get, writable } from 'svelte/store';
import { dataStore } from './session/data.svelte';
import { browser } from '$app/environment';
import { PUBLIC_API_VERSION, PUBLIC_BACKEND_URL } from '$env/static/public';
import { keysStore } from '@gandlaf21/cashu-wallet-engine';
import { appMode } from './local/mode';
export let socket: undefined | WebSocket;


const handleSocketCommand = (data: { command: string; data: any }) => {

	switch (data.command) {
		case 'ping': {
			dataStore.updateConnections(data?.data)
			break
		}
		case 'new-offer':
			dataStore.newOffer(data?.data?.offer);
			break;
		case 'new-receipt':
			dataStore.newReceipt(data?.data?.receipt);
			break;
		case 'new-claim':
			dataStore.newClaim(data?.data?.claim);
			break;
		case 'update-offer':
			dataStore.updateOffer(data?.data?.offer);
			break;
		case 'update-receipt':
			dataStore.updateReceipt(data?.data?.receipt);
			break;
			case 'update-claim':
				dataStore.updateClaim(data?.data?.claim);
				break;
		default:
	}
};

const handleSocketMessage = (message: MessageEvent) => {
	const dataStr = message.data;
	if (!dataStr) {
		return;
	}
	let data;
	try {
		data = JSON.parse(dataStr);
	} catch (error) {
		console.error('could not parse JSON: ', dataStr);
	}
	handleSocketCommand(data);
};
let wsInterval: Timer | undefined = undefined;

export const reconnectWebSocket = () => {
	if (!browser) {
		return;
	}
	setTimeout(() => {
		reconnectWebSocket();
	}, 5000);
	if (socket === undefined || socket.readyState === WebSocket.CLOSED) {
		socket = new WebSocket(`${PUBLIC_BACKEND_URL}/api/${PUBLIC_API_VERSION}/ws`, get(keysStore)[0]?.publicKey);
		socket.onopen = () => {
			if (wsInterval) {
				clearInterval(wsInterval);
			}
			wsInterval = setInterval(() => {
				socket?.send(JSON.stringify({ command: 'pong', data: {
					pubkey: get(keysStore)[0]?.publicKey,
					mode: get(appMode)
				} }));
			}, 5000);
		};
		socket.onmessage = (message) => {
			// here we got something sent from the server
			handleSocketMessage(message);
		};
	}
};
