import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const storedValue = browser ? window.localStorage.getItem('use-password') ?? undefined : undefined;
const initial: 'true' | 'false' | undefined =
	storedValue === 'true' || storedValue === 'false' ? storedValue : undefined;

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

usePassword.subscribe((value) => {
	if (!browser) return;
	if (value === undefined) {
		window.localStorage.removeItem('use-password');
		return;
	}
	window.localStorage.setItem('use-password', value ? 'true' : 'false');
});
