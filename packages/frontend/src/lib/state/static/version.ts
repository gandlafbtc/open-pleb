import { readable } from 'svelte/store';

const version = readable<string>('1.0.0');

export { version };
