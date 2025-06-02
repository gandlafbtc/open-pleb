<script lang="ts">
	// import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import '../app.css';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { onMount } from 'svelte';
	import { priceStore } from '$lib/stores/price';
	import { init } from '$lib/init';
	import { browser } from '$app/environment';
	import { LoaderCircle, X } from 'lucide-svelte';
	import { slide } from 'svelte/transition';

	import { init as initCashu, mintsStore } from "@gandlaf21/cashu-wallet-engine";
	import TinyBondWallet from '$lib/elements/bond-wallet/TinyBondWallet.svelte';
	import PayEarnToggle from '$lib/elements/PayEarnToggle.svelte';
	import { appMode } from '$lib/stores/local/mode';
	import Button from '$lib/components/ui/button/button.svelte';
	import InstallPrompt from '$lib/elements/InstallPrompt.svelte';
	import PushNotification from '$lib/elements/PushNotification.svelte';
	import { ModeWatcher } from "mode-watcher";
	import { dataStore } from '$lib/stores/session/data.svelte';

	
	const { children } = $props();
	
	let isInit = $state(false);
	let showAlphaBanner = $state(false);
	let initStatus = $state("Initializing");
	
	onMount(() => {
		if (browser) {
			initCashu().then(async () => {
				await init()
				const {OPENPLEB_MINT_URL } = dataStore.env;
				initStatus = "Updating mint"
				await mintsStore.fetchMint(OPENPLEB_MINT_URL)
				isInit = true;
				showAlphaBanner=true
			}).catch((error) => {
				console.error('Error initializing Cashu:', error);
			});
		}
		priceStore.refresh();
	});
</script>
<ModeWatcher></ModeWatcher>

<!-- Alpha Banner -->
{#if showAlphaBanner}
<div 
  in:slide={{ duration: 400, axis: 'y', delay: 300 }}
  out:slide={{ duration: 300, axis: 'y' }}
  class="fixed top-0 left-0 w-full bg-amber-500 flex items-center justify-center z-50 text-black font-medium shadow-md"
>
  <p>⚠️ This application is in early alpha. Use at your own risk. ⚠️</p>
  <button 
    class="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-amber-600 rounded-full"
    onclick={() => showAlphaBanner = false}
    aria-label="Close banner"
  >
    <X class="h-4 w-4" />
  </button>
</div>
{/if}

<Toaster richColors closeButton />
<InstallPrompt />
<PushNotification />
{#if isInit}
	{#if $appMode !== undefined}
	<Sidebar.Provider>
		<AppSidebar />
		<Sidebar.Inset>
			<header class="flex h-16 shrink-0 items-center justify-start gap-2 border-b px-4">
				<Sidebar.Trigger class="-ml-1" />
				<Separator orientation="vertical" class="mr-2 h-4" />
				<div class="w-full flex items-end justify-between">
					<TinyBondWallet></TinyBondWallet>
					<div>
						<PayEarnToggle></PayEarnToggle>
					</div>
				</div>
			</header>
			<!-- <ParaglideJS {i18n}> -->
				<div class="flex h-full w-full flex-col items-center justify-center gap-2">
					{@render children()}
				</div>
			<!-- </ParaglideJS> -->
		</Sidebar.Inset>
	</Sidebar.Provider>

	{:else}
	<div class="flex h-screen w-screen items-center justify-center">

	<div class="flex flex-col gap-2 w-80 xl:w-[600px] items-center justify-center">
		<p class='text-xl font-bold'>
			Welcome to OpenPleb. Here you can: 
		</p>
		<p>
			1. Pay bank QRs with Bitcoin. 
		</p>
		<p>
			2. Earn Bitcoin for paying Bank QRs. 
		</p>
		<p>Choose what you want to do. (You can change this later)</p>
		<Button onclick={()=> appMode.set('pay')} class='w-full mt-5' variant="outline">Pay Bank QR</Button>
		<Button onclick={()=> appMode.set('earn')} class="w-full mt-5" variant="outline">Earn Bitcoin</Button>
	</div>
</div>
	
	{/if}
{:else}
	<div class="flex flex-col gap-2 h-screen w-screen items-center justify-center">
		<LoaderCircle class="animate-spin"></LoaderCircle>
		{initStatus}
	</div>
{/if}
