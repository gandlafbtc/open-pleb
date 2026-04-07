<script lang="ts">
	import type { CocoWallet } from '$lib/state/wallet/wallet.svelte';
	import { Key, ChevronDown, LoaderCircle, Plus } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import BatBalanceDelta from './BatBalanceDelta.svelte';

	let wallet: CocoWallet = $state(undefined) as CocoWallet;

	const batsBalance = $derived(wallet?.batsBalance ?? 0);

	let showDropdown = $state(false);
	let isLoading = $state(false);

	onMount(async () => {
		const { wallet: w } = await import('$lib/state/wallet/wallet.svelte');
		wallet = w;
	});

	function toggleDropdown() {
		showDropdown = !showDropdown;
	}

	function closeDropdown() {
		showDropdown = false;
	}

	async function handleTopUpBAT() {
		if (!wallet) return;
		isLoading = true;
		closeDropdown();
		try {
			// refreshAuthSession now handles ensuring session exists + topping up BAT
			await wallet.refreshAuthSession();
			toast.success('BAT topped up');
		} catch (error) {
			toast.error('Failed to top up BAT');
			console.error(error);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="flex items-center">
	<div class="relative">
		<button
			onclick={toggleDropdown}
			disabled={isLoading || !wallet}
			class="h-8 w-16 flex items-center justify-between gap-1 px-2 py-1 bg-primary/10 rounded-md text-xs hover:bg-primary/20 transition-colors disabled:opacity-50"
		>
			<Key class="w-3 h-3 text-primary" />
			{#if isLoading}
			  <LoaderCircle class="animate-spin w-3"></LoaderCircle>
			{:else}
				<span class="font-medium">{batsBalance}</span>
			{/if}
			<ChevronDown class="w-3 h-3 text-primary" />
		</button>

		{#if showDropdown}
			<button
				class="fixed inset-0 z-40"
				onclick={closeDropdown}
				tabindex="-1"
				aria-hidden="true"
			></button>
			<div
				class="absolute left-0 mt-1 w-48 bg-background border border-border rounded-md shadow-lg z-50"
			>
				<div class="py-1">
					<button
						onclick={handleTopUpBAT}
						class="hover:bg-foreground/10 cursor-pointer rounded-md  flex-col w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2"
					>
						<div class="flex gap-1 items-center relative">
							<div class="absolute top-2 left-2">
								
								<Plus class="w-3"></Plus>
							</div>
							<Key class="w-3"></Key>
							<p>
								Get Blind Auth tokens
							</p>
						</div>
						<p class="text-muted-foreground text-sm">
							Blind Auth tokens are used to authorize certain actions, without revealing your identity.
						</p>
					</button>
				</div>
			</div>
		{/if}
	</div>
	<div class="relative w-12 h-8">
		<BatBalanceDelta />
	</div>
</div>
