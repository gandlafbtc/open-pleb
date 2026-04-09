<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import CountdownCircle from '$lib/elements/offer/CountdownCircle.svelte';
	import { getUnixNow } from 'common/util';

	// Mock data type - replace with actual type later
	interface Offer {
		id: string;
		youEarn: number;
		totalAmount: number;
		expiresAt: number;
	}

	// Mock data for demonstration
	const mockOffers: Offer[] = [
		{ id: '1', youEarn: 113, totalAmount: 723, expiresAt: getUnixNow() + 300 },
		{ id: '2', youEarn: 7263, totalAmount: 180000, expiresAt: getUnixNow() + 180 },
		{ id: '3', youEarn: 200, totalAmount: 1000, expiresAt: getUnixNow() + 123},
		{ id: '4', youEarn: 456, totalAmount: 2500, expiresAt: getUnixNow() + 80 }
	];

	const displayOffers = mockOffers;

	function formatSats(amount: number): string {
		return amount.toLocaleString();
	}
</script>

<div class="space-y-3">
	{#each displayOffers as offer (offer.id)}
		<button
			class="w-full transition-all active:scale-[0.995]"
			onclick={() => {
				// Handle offer click
				console.log('Offer clicked:', offer.id);
			}}
		>
			<Card class="p-2 border hover:border-primary/50 transition-colors">
				<div class="flex items-center gap-4">
					<!-- Timer Badge with Donut Circle -->
					<CountdownCircle expiresAt={offer.expiresAt} />

					<!-- You Earn Section -->
					<div class="flex-1 text-left">
						<p class="text-sm text-muted-foreground">you earn</p>
						<p class="font-bold">{formatSats(offer.youEarn)} sats</p>
					</div>

					<!-- Total Amount -->
					<div class="text-right">
						<p class="font-bold">{formatSats(offer.totalAmount)} sats</p>
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
