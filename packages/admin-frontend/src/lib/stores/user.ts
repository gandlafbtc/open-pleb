import { toast } from "svelte-sonner"
import { goto } from "$app/navigation"
import { init } from "$lib/init"
import { get, writable } from 'svelte/store';
import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import { scrypt } from "@noble/hashes/scrypt";
import { bytesToHex } from "@noble/hashes/utils";
import { dataStore } from "./data.svelte";

export let socket: undefined | WebSocket;

const { PUBLIC_BACKEND_URL} = env;

const handleSocketCommand = (data: { command: string; data: any }) => {

	switch (data.command) {
		case 'ping': {
			console.log("ping")
			break
		}
        case 'new-offer':
            console.log("new offer received" , data.data.offer.id)
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
			break
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
    const user = get(userLoggedIn)
    if (!user?.access_token) {
        return
    }
	if (socket === undefined || socket.readyState === WebSocket.CLOSED) {
		socket = new WebSocket(`${PUBLIC_BACKEND_URL}/admin/ws`, user.access_token);
		socket.onopen = () => {
			if (wsInterval) {
				clearInterval(wsInterval);
			}
			wsInterval = setInterval(() => {
				socket?.send(JSON.stringify({ command: 'pong', data: {
				} }));
			}, 5000);
		};
		socket.onmessage = (message) => {
			// here we got something sent from the server
			handleSocketMessage(message);
		};
	}
};
export type User = {
    access_token: string
    id: string,
    username: string
}
const createUserLoggedInStore = () => {
    const defaultValueString = browser ? localStorage.getItem('user') ?? undefined : undefined
    let defaultValue: User | undefined = undefined
    if (defaultValueString) {
        if (defaultValueString !== 'undefined') {
            defaultValue = JSON.parse(defaultValueString)
        }
    }
    const store = writable<User | undefined>(defaultValue)

    store.subscribe((value) => {
        if (browser) {
            if (!value) {
                localStorage.setItem('user', '')
            }
            localStorage.setItem('user', JSON.stringify(value))
        }
    })
    const signup = async (username: string, password: string) => {
        const pwHash = bytesToHex(
            scrypt(password, 'openPlebSalt-110100100010', { N: 2 ** 16, r: 8, p: 1, dkLen: 32 })
        );
        const response = await fetch(`${PUBLIC_BACKEND_URL}/admin/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
                    : pwHash
            })
        });
        const data = await response.json()
        if (!data.success) {
            throw new Error(data.message);
        }
        userLoggedIn.set(data.data.user)
        await init()
        socket = new WebSocket(`${PUBLIC_BACKEND_URL}/admin/ws`, [data.data.user.access_token])
        return data
    }
    const login = async (username: string, password: string) => {
        const pwHash = bytesToHex(
            scrypt(password, 'openPlebSalt-110100100010', { N: 2 ** 16, r: 8, p: 1, dkLen: 32 })
        );
        let response = await fetch(`${PUBLIC_BACKEND_URL}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
                    : pwHash
            })
        });
        const data = await response.json()
        if (!data.success) {
            throw new Error(data.message);
        }
        userLoggedIn.set(data.data.user)
        await init()
        socket = new WebSocket(`${PUBLIC_BACKEND_URL}/admin/ws`, [data.data.user.access_token])
        return data
    }

    const logout = () => {
        store.set(undefined)
        socket?.close()
        toast.success('Logged out')
        goto('/login')
    }
    return { ...store, logout, login, signup }
}

export const userLoggedIn = createUserLoggedInStore()