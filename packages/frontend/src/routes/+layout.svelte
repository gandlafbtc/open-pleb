<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import '../app.css';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { page } from '$app/state';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { onMount } from 'svelte';
	import { priceStore } from '$lib/stores/price';
	import { init } from '$lib/init';
	import { browser } from '$app/environment';
	import { LoaderCircle } from 'lucide-svelte';
	const { children } = $props();

	let isInit = $state(false);

	onMount(() => {
		if (browser) {
			init().finally(() => {
				isInit = true;
			});
		}
		priceStore.refresh();
		const interval = setInterval(() => {
			priceStore.refresh();
		}, 10000);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<Toaster richColors closeButton />
{#if isInit}
	<Sidebar.Provider>
		<AppSidebar />
		<Sidebar.Inset>
			<header class="flex h-16 shrink-0 items-center justify-start gap-2 border-b px-4">
				<Sidebar.Trigger class="-ml-1" />
				<Separator orientation="vertical" class="mr-2 h-4" />
			</header>
			<ParaglideJS {i18n}>
				<div class="flex h-full w-full flex-col items-center justify-center gap-2">
					{@render children()}
				</div>
			</ParaglideJS>
		</Sidebar.Inset>
	</Sidebar.Provider>
{:else}
	<div class="flex h-screen w-screen items-center justify-center">
		<LoaderCircle class="animate-spin"></LoaderCircle>
	</div>
{/if}
