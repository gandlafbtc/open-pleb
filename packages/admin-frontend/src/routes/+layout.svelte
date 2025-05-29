<script lang="ts">
	// import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import '../app.css';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { onMount } from 'svelte';
	import { init } from '$lib/init';
	import { LoaderCircle } from 'lucide-svelte';

	import { ModeWatcher } from "mode-watcher";



	const { children } = $props();

	let isInit = $state(false);

	onMount(async () => {
		await init();
		isInit = true
	});
</script>
<ModeWatcher></ModeWatcher>
<Toaster richColors closeButton />
{#if isInit}
	{@render children()}
{:else}
	<div class="flex flex-col gap-2 h-screen w-screen items-center justify-center">
		<LoaderCircle class="animate-spin"></LoaderCircle>
	</div>
{/if}