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

	import { init as initCashu, mintsStore } from "@gandlaf21/cashu-wallet-engine";
	import { env} from '$env/dynamic/public';
	import TinyBondWallet from '$lib/elements/bond-wallet/TinyBondWallet.svelte';
	import PayEarnToggle from '$lib/elements/PayEarnToggle.svelte';
	import { appMode } from '$lib/stores/local/mode';
	import Button from '$lib/components/ui/button/button.svelte';

	const {PUBLIC_MINT_URL } = env;

	const { children } = $props();

	let isInit = $state(false);

	onMount(() => {
		if (browser) {
			initCashu().then(async () => {
				await init()
				await mintsStore.fetchMint(PUBLIC_MINT_URL)
				isInit = true;
			}).catch((error) => {
				console.error('Error initializing Cashu:', error);
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
			<ParaglideJS {i18n}>
				<div class="flex h-full w-full flex-col items-center justify-center gap-2">
					{@render children()}
				</div>
			</ParaglideJS>
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
	<div class="flex h-screen w-screen items-center justify-center">
		<LoaderCircle class="animate-spin"></LoaderCircle>
	</div>
{/if}
