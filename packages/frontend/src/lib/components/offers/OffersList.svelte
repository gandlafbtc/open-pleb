<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import CountdownCircle from '$lib/elements/offer/CountdownCircle.svelte';
	import { offerListState } from '$lib/state/dynamic/offerList.svelte';
	import { offerFilterState } from '$lib/state/persistent/local/offerFilter.svelte';
	import { providerState } from '$lib/state/dynamic/provider.svelte';
	import { calcTakerFee } from 'common/calc';
	import { SlidersVertical, X, Trash2, BrushCleaning } from '@lucide/svelte';
	import Button from '../ui/button/button.svelte';
	import OffersFilterDrawer from './OffersFilterDrawer.svelte';
	import Badge from '../ui/badge/badge.svelte';

	// Get active offers from state
	const activeOffers = $derived(offerListState.offers);
	
	// Apply filters in the view
	const displayOffers = $derived.by(() => {
		const filters = offerFilterState.selectedProviderIds;
		
		// If no filters selected, show all active offers
		if (filters.length === 0) {
			return activeOffers;
		}
		
		// Filter by selected providers
		return activeOffers.filter(offer => 
			offer.fiatProviderId !== null && filters.includes(offer.fiatProviderId)
		);
	});

	const displayOffersCount = $derived(displayOffers.length)

	let drawerOpen = $state(false);

	function formatSats(amount: number): string {
		return amount.toLocaleString();
	}

	function handleOfferClick(offerId: number) {
		console.log('handle claim prompt' + offerId);
	}

	function showFilters() {
		drawerOpen = true;
	}

	function clearFilters() {
		offerFilterState.clearFilters();
	}

	function getProviderIcon(providerId: number | null): string | null {
		if (providerId === null) return null;
		const provider = providerState.providers.find(p => p.id === providerId);
		return provider?.icon ?? null;
	}

	function handlePurge() {
		offerListState.purgeInactiveOffers();
	}

	// Check if there are any inactive offers to purge
	const hasInactiveOffers = $derived(offerListState.offers.length > offerListState.activeOffers.length);
</script>

<OffersFilterDrawer bind:open={drawerOpen} onOpenChange={(o) => (drawerOpen = o)} />

<div class="mt-6 flex flex-col gap-2">
	<div class="flex items-center justify-between gap-2">
		<div class="flex gap-2 items-center">

			<h1 class="font-bold">Offers to claim {#if displayOffersCount}
				({displayOffersCount})
				{/if}</h1>
				{#if hasInactiveOffers}
				<Button variant="ghost" size="icon" onclick={handlePurge} title="Remove expired/claimed offers">
					<BrushCleaning class="h-4 w-4" />
				</Button>
				{/if}
			</div>
		<div class="flex items-center gap-1">
			{#if offerFilterState.hasActiveFilters()}
				<Badge variant="outline" onclick={clearFilters}>
					<X class="h-4 w-4" />
					Clear all filters
				</Badge>
			{/if}
			<Button variant="ghost" size="icon" onclick={showFilters}>
				<SlidersVertical class="h-4 w-4" />
			</Button>
		</div>
	</div>
	<div class="space-y-3">
		{#each displayOffers as offer (offer.id)}
			{@const isDisabled=!offerListState.activeOffers.find(o=>o.id===offer.id)}
			<button
				disabled={isDisabled}
				class="w-full transition-all active:scale-[0.995]"
				onclick={() => handleOfferClick(offer.id)}
			>
				<Card class="border p-2 px-3 transition-colors hover:border-primary/50 {isDisabled?"opacity-50":""}">
					<div class="flex items-center gap-4">
					<!-- Timer Badge with Donut Circle -->
					 {#if isDisabled}
					   <p class="text-destructive font-bold">
						EXP
					   </p>
					 {:else}
					 	<CountdownCircle expiresAt={offer.expiresAt ?? 0} />
					   
					 {/if}

					

					<!-- You Earn Section -->
						<div class="flex-1 text-left">
							<p class="text-sm text-muted-foreground">you earn</p>
							<p class="font-bold">{formatSats(calcTakerFee(offer))} sats</p>
						</div>

						<!-- Total Amount -->
						<div class="text-right flex flex-col justify-end items-end">
						 <!-- icon -->
					{#if getProviderIcon(offer.fiatProviderId)}
						<img 
							src={getProviderIcon(offer.fiatProviderId)} 
							alt="Provider" 
							class="h-4 w-4 rounded"
						/>
					{/if}
							<p class="font-bold">{formatSats(offer.satsAmount)} sats</p>
						</div>
					</div>
				</Card>
			</button>
		{/each}

		{#if displayOffers.length === 0}
			<div class="py-8 text-center">
				<p class="text-muted-foreground">No offers available</p>
			</div>
		{/if}
	</div>
</div>
