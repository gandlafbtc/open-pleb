<script lang="ts">
	import { offerState } from '$lib/state/dynamic/offer.svelte';
	import { env } from '$lib/state/dynamic/env.svelte';
	import { sessionStore } from '$lib/state/persistent/db/repos/session';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Plus, Coins, User } from '@lucide/svelte';
	import CountdownCircle from '$lib/elements/offer/CountdownCircle.svelte';
	import { clock } from '$lib/state/clock.svelte';

	const offers = $derived(offerState.offers);
	const isLoading = $derived(offerState.isLoading);
	const currency = $derived(env.settings?.OPENPLEB_CURRENCY || 'USD');
	const sessions = $derived(sessionStore.data);

	function getOfferRole(offer: typeof offers[0]): 'maker' | 'taker' | null {
		// Check if we have a session that matches the maker or taker session ID
		const isMaker = sessions.some(s => s.sessionId === offer.makerSessionId);
		const isTaker = offer.takerSessionId && sessions.some(s => s.sessionId === offer.takerSessionId);
		
		if (isMaker) return 'maker';
		if (isTaker) return 'taker';
		return null;
	}

	function isExpired(expiresAt: number): boolean {
		return clock.time > expiresAt;
	}

	function formatNumber(num: number): string {
		return num.toLocaleString();
	}

	function formatFiatAmount(amount: number): string {
		// Determine if currency uses decimals
		const noDecimalCurrencies = ['KRW', 'JPY', 'VND', 'IDR'];
		const usesDecimals = !noDecimalCurrencies.includes(currency);
		
		if (usesDecimals) {
			return amount.toFixed(2);
		}
		return amount.toString();
	}

	function getStatusColor(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
		switch (status.toLowerCase()) {
			case 'open':
			case 'active':
				return 'default';
			case 'pending':
				return 'secondary';
			case 'completed':
				return 'outline';
			case 'cancelled':
			case 'expired':
				return 'destructive';
			default:
				return 'outline';
		}
	}

	function handleOfferClick(offerId: number) {
		goto(resolve(`/offer/${offerId}`));
	}

	function handleCreateOffer() {
		goto(resolve('/offer/new'));
	}
</script>

<div class="container mx-auto p-4 max-w-4xl space-y-6">
	<!-- Header -->
	<div class="flex justify-between items-center">
		<div>
			<h1 class="text-3xl font-bold">My Offers</h1>
			<p class="text-muted-foreground">Browse and manage your offers</p>
		</div>
		<Button onclick={handleCreateOffer}>
			<Plus class="mr-2 h-4 w-4" />
			Create Offer
		</Button>
	</div>

	<!-- Loading State -->
	{#if isLoading}
		<div class="flex justify-center items-center py-12">
			<div class="text-center space-y-2">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
				<p class="text-muted-foreground">Loading offers...</p>
			</div>
		</div>
	{:else if offers.length === 0}
		<!-- Empty State -->
		<Card>
			<CardContent class="flex flex-col items-center justify-center py-12 space-y-4">
				<div class="rounded-full bg-muted p-4">
					<Coins class="h-12 w-12 text-muted-foreground" />
				</div>
				<div class="text-center space-y-2">
					<h3 class="text-xl font-semibold">No offers yet</h3>
					<p class="text-muted-foreground max-w-sm">
						Create your first offer to start trading Bitcoin for fiat currency.
					</p>
				</div>
				<Button onclick={handleCreateOffer}>
					<Plus class="mr-2 h-4 w-4" />
					Create Your First Offer
				</Button>
			</CardContent>
		</Card>
	{:else}
		<!-- Offers List -->
		<div class="grid gap-4">
			{#each offers as offer}
				<Card 
					class="cursor-pointer hover:shadow-lg transition-shadow"
					onclick={() => handleOfferClick(offer.id)}
				>
					<CardHeader>
						<div class="flex justify-between items-start">
							<div class="space-y-1">
								<CardTitle class="text-2xl">
									{formatFiatAmount(offer.fiatAmount)} {offer.fiatCurrency}
								</CardTitle>
								<p class="text-sm text-muted-foreground">
									Offer #{offer.id}
								</p>
							</div>
							<div class="flex gap-2">
								{#if getOfferRole(offer)}
									<Badge variant="outline">
										{getOfferRole(offer)}
									</Badge>
								{/if}
								<Badge variant={getStatusColor(offer.status)}>
									{offer.status}
								</Badge>
							</div>
						</div>
					</CardHeader>
					<CardContent class="space-y-3">
						<!-- Sats Amount -->
						<div class="flex items-center justify-between">
							<span class="text-sm text-muted-foreground flex items-center gap-2">
								<Coins class="h-4 w-4" />
								Sats Amount
							</span>
							<span class="font-semibold">{formatNumber(offer.satsAmount)} sats</span>
						</div>

						<!-- Payment Address -->
						{#if offer.fiatAddress}
							<div class="flex items-center justify-between">
							<span class="text-sm text-muted-foreground flex items-center gap-2">
								<User class="h-4 w-4" />
								Payment Address
							</span>
								<span class="text-sm font-mono truncate max-w-[200px]">{offer.fiatAddress}</span>
							</div>
						{/if}

						<!-- Expiration -->
						{#if offer.expiresAt}
							<div class="flex items-center justify-between">
								{#if isExpired(offer.expiresAt)}
								<span class="text-sm text-destructive font-semibold">Expired</span>
								{:else}
								<span class="text-sm text-muted-foreground flex items-center gap-2">
									<CountdownCircle expiresAt={offer.expiresAt} compact />
									Expires
								</span>
								{/if}
								<span class="text-sm">
									{new Date(offer.expiresAt * 1000).toLocaleString()}
								</span>
							</div>
						{/if}

						<!-- Description Preview -->
						{#if offer.description}
							<div class="pt-2 border-t">
								<p class="text-sm text-muted-foreground line-clamp-2">
									{offer.description}
								</p>
							</div>
						{/if}
					</CardContent>
				</Card>
			{/each}
		</div>
	{/if}
</div>
