<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import CountdownCircle from '$lib/elements/offer/CountdownCircle.svelte';
	import { offerListState } from '$lib/state/dynamic/offerList.svelte';
	import { calcTakerFee } from 'common/calc';

	// Get offers from state
	const displayOffers = $derived(offerListState.offers);

	function formatSats(amount: number): string {
		return amount.toLocaleString();
	}

	function handleOfferClick(offerId: number) {
		console.log("handle claim prompt"+offerId)
	}
</script>

<div class="space-y-3">
	{#each displayOffers as offer (offer.id)}
		<button
			class="w-full transition-all active:scale-[0.995]"
			onclick={() => handleOfferClick(offer.id)}
		>
			<Card class="p-2 border hover:border-primary/50 transition-colors">
				<div class="flex items-center gap-4">
					<!-- Timer Badge with Donut Circle -->
					<CountdownCircle expiresAt={offer.expiresAt??0} />

					<!-- You Earn Section -->
					<div class="flex-1 text-left">
						<p class="text-sm text-muted-foreground">you earn</p>
						<p class="font-bold">{formatSats(calcTakerFee(offer))} sats</p>
					</div>

					<!-- Total Amount -->
					<div class="text-right">
						<p class="font-bold">{formatSats(offer.satsAmount)} sats</p>
					</div>
				</div>
			</Card>
		</button>
	{/each}

	{#if displayOffers.length === 0}
		<div class="text-center py-8">
			<p class="text-muted-foreground">No offers available</p>
		</div>
	{/if}
</div>
