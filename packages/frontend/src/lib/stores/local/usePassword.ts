import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const initial: 'true' | 'false' | undefined = browser
	? window.localStorage.getItem('use-password')
	: undefined;

const getInitial = (initial: 'true' | 'false' | undefined) => {
	switch (initial) {
		case 'true':
			return true;
		case 'false':
			return false;
		default:
			return undefined;
	}
};

export let usePassword = writable<boolean | undefined>(getInitial(initial));

usePassword.subscribe(async (value) => {
	const stringValue = JSON.stringify(value);
	if (browser) {
		window.localStorage.setItem('use-password', stringValue);
	}
});
