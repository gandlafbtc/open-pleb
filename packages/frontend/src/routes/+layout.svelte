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
	import SettingsButton from '$lib/elements/settings/SettingsButton.svelte';


	onMount(async () => {
			await init();
	});
	let { children } = $props();
</script>

<svelte:head><link rel="icon" href="/logo/logo-mark-prim.svg" /></svelte:head>
<ModeWatcher />
<SplashScreen></SplashScreen>

{#if localstore.isOnboarded}
		<SettingsButton></SettingsButton>
		{@render children()}
{:else}
	<Onboarding></Onboarding>
{/if}

<div style="display:none">
	{#each locales as locale}
		<a href={localizeHref(page.url.pathname, { locale })}>
			{locale}
		</a>
	{/each}
</div>
