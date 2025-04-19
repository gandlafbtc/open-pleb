import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const initial: 'pay' | 'earn' | undefined = browser
	? window.localStorage.getItem('app-mode') as 'pay' | 'earn' | undefined
	: undefined;

const getInitial = (initial: 'pay' | 'earn' | undefined) => {
	switch (initial) {
		case 'pay':
			return "pay";
		case 'earn':
			return "earn";
		default:
			return undefined;
	}
};

export const appMode = writable<"pay" | "earn" |  undefined>(getInitial(initial));

appMode.subscribe(async (value) => {
	if (browser) {
		window.localStorage.setItem('app-mode', value as string);
	}
});
