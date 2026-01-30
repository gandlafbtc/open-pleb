import type { Config } from 'tailwindcss';

export default {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'../ui/**/*.{html,js,svelte,ts}'
	]
} satisfies Config;
