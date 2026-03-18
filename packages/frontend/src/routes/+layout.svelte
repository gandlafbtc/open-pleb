<script lang="ts">
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import './layout.css';
	import { ModeWatcher } from 'mode-watcher';
	import { onMount } from 'svelte';
	import { init } from '$lib/app/init';
	import { localstore } from '$lib/state/persistent/local/localstore.svelte';
	import Onboarding from '$lib/elements/onboarding/Onboarding.svelte';
	import SplashScreen from '$lib/components/SplashScreen.svelte';
	import Header from '$lib/elements/page/Header.svelte';
	import { seedPhrase } from '$lib/state/persistent/db/repos/seedPhrase';
	import IDCreation from '$lib/elements/onboarding/idcreation/IDCreation.svelte';
	import { toast, Toaster } from 'svelte-sonner';
	import { ensureError } from 'common/errors';
	import FloatingWallet from '$lib/components/wallet/FloatingWallet.svelte';

	onMount(async () => {
		try {
			await init();
		} catch (error) {
			console.error(error)
			const err = ensureError(error)
			toast.error(`Failed to initialize: ${err.message}`)
		}
	});
	let { children } = $props();
</script>

<svelte:head><link rel="icon" href="/logo/logo-mark-prim.svg" /></svelte:head>
<ModeWatcher />
<SplashScreen></SplashScreen>
<Toaster richColors />
<!-- If not onboarded, show onboarding -->
{#if !localstore.isOnboarded}
	<Onboarding></Onboarding>
{:else}
	<!-- if no ID, create ID -->
	{#if !seedPhrase.data.length}
		<IDCreation></IDCreation>
	{:else}
	
	{#if !page.url.pathname.startsWith("/id")}
		<Header></Header>
	{/if}
	<div class="m-2">
		{@render children()}
	</div>

	<!-- Floating Wallet Button -->
	<FloatingWallet />

	{/if}
{/if}

<div style="display:none">
	{#each locales as locale}
		<a href={localizeHref(page.url.pathname, { locale })}>
			{locale}
		</a>
	{/each}
</div>
