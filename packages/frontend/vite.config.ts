import { paraglide } from '@inlang/paraglide-sveltekit/vite';
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		paraglide({
			project: './project.inlang',
			outdir: './src/lib/paraglide'
		})
	],
	server: {
		allowedHosts: ['https://b739-119-195-118-103.ngrok-free.app']
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
