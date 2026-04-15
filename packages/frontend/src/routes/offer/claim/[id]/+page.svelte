<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { offerListState } from '$lib/state/dynamic/offerList.svelte';
	import { providerState } from '$lib/state/dynamic/provider.svelte';
	import { blindSessionState } from '$lib/state/dynamic/blindSession.svelte';
	import { wallet } from '$lib/state/wallet/wallet.svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import CountdownCircle from '$lib/elements/offer/CountdownCircle.svelte';
	import { calcTakerFee, calcTakerBond } from 'common/calc';
	import { Coins, Clock, AlertCircle, TrendingUp, Shield, ArrowLeft } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { getAppApiBaseUrl } from '$lib/interface/rest/const';

	// Get offer ID from URL params
	const offerId = $derived(parseInt(page.params.id || '0'));
	
	// Find the offer from activeOffers (automatically filters expired offers)
	const offer = $derived(offerListState.activeOffers.find(o => o.id === offerId));
	const provider = $derived(
		offer?.fiatProviderId 
			? providerState.providers.find(p => p.id === offer.fiatProviderId) 
			: null
	);

	// Check if offer exists in all offers but not in active (means it's expired)
	const isExpired = $derived(
		!offer && offerListState.offers.some(o => o.id === offerId)
	);

	// Calculate earnings and bond
	const takerFee = $derived(offer ? calcTakerFee(offer) : 0);
	const takerBond = $derived(offer ? calcTakerBond(offer) : 0);

	// Check if user has active session
	const hasActiveSession = $derived(!!blindSessionState.currentSession);

	// Check if user has enough balance
	const hasEnoughBalance = $derived(wallet.balance >= takerBond);

	let isClaimingOffer = $state(false);

	function formatSats(amount: number): string {
		return amount.toLocaleString();
	}

	function formatFiatAmount(amount: number, currency: string): string {
		const noDecimalCurrencies = ['KRW', 'JPY', 'VND', 'IDR'];
		const usesDecimals = !noDecimalCurrencies.includes(currency);
		
		if (usesDecimals) {
			return amount.toFixed(2);
		}
		return amount.toString();
	}

	function handleBack() {
		goto(resolve('/'));
	}

	async function handleClaimOffer() {
		if (!offer || !hasActiveSession) {
			toast.error('Cannot claim offer: No active session');
			return;
		}

		if (!hasEnoughBalance) {
			toast.error(`Insufficient balance. You need ${formatSats(takerBond)} sats for the security deposit.`);
			return;
		}

		isClaimingOffer = true;

		try {
			// Call the claim API endpoint
			const response = await fetch(`${getAppApiBaseUrl()}/offer/${offerId}/claim`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					sessionId: blindSessionState.currentSession?.sessionId,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to claim offer');
			}

			const result = await response.json();
			
			if (result.success) {
				toast.success('Offer claimed successfully!');
				// Navigate to the offer detail page where they can continue the flow
				goto(resolve(`/offer/${offerId}`));
			} else {
				throw new Error(result.error || 'Failed to claim offer');
			}
		} catch (error) {
			console.error('Error claiming offer:', error);
			toast.error(error instanceof Error ? error.message : 'Failed to claim offer');
		} finally {
			isClaimingOffer = false;
		}
	}
</script>

<div class="container mx-auto p-4 max-w-2xl flex flex-col gap-4">
	<!-- Back Button -->
	<Button variant="ghost" size="sm" onclick={handleBack} class="w-fit">
		<ArrowLeft class="h-4 w-4 mr-2" />
		Back to Offers
	</Button>

	{#if !offer}
		<!-- Not Found State -->
		<Card>
			<CardContent class="flex flex-col items-center justify-center py-12 space-y-4">
				<div class="rounded-full bg-muted p-4">
					<AlertCircle class="h-12 w-12 text-muted-foreground" />
				</div>
				<div class="text-center space-y-2">
					<h3 class="text-xl font-semibold">Offer not found</h3>
					<p class="text-muted-foreground max-w-sm">
						This offer may have been claimed or removed.
					</p>
				</div>
			</CardContent>
		</Card>
	{:else if isExpired}
		<!-- Expired State -->
		<Card>
			<CardContent class="flex flex-col items-center justify-center py-12 space-y-4">
				<div class="rounded-full bg-destructive/10 p-4">
					<Clock class="h-12 w-12 text-destructive" />
				</div>
				<div class="text-center space-y-2">
					<h3 class="text-xl font-semibold">Offer Expired</h3>
					<p class="text-muted-foreground max-w-sm">
						This offer has expired and can no longer be claimed.
					</p>
				</div>
			</CardContent>
		</Card>
	{:else}
	
		<Card>
			<CardContent class="space-y-3">
				<!-- Fiat Amount -->
				<div class="flex items-center justify-between">
					<span class="text-sm text-muted-foreground">Fiat Amount</span>
					<span class="font-semibold">
						{formatFiatAmount(offer.fiatAmount, offer.fiatCurrency)} {offer.fiatCurrency}
					</span>
				</div>

				<!-- Provider -->
				{#if provider}
					<div class="flex items-center justify-between">
						<span class="text-sm text-muted-foreground">Provider</span>
						<div class="flex items-center gap-2">
							<img src={provider.icon} alt={provider.label} class="w-4 h-4 rounded" />
							<span class="font-semibold">{provider.label}</span>
						</div>
					</div>
				{/if}

				<!-- Sats Amount -->
				<div class="flex items-center justify-between">
					<span class="text-sm text-muted-foreground flex items-center gap-1.5">
						<Coins class="h-3.5 w-3.5" />
						Sats Amount
					</span>
					<span class="font-semibold">{formatSats(offer.satsAmount)}</span>
				</div>

				<!-- Exchange Rate -->
				<div class="flex items-center justify-between">
					<span class="text-sm text-muted-foreground">Exchange Rate</span>
					<span class="font-mono text-sm">{offer.conversionRate}</span>
				</div>

				{#if offer.expiresAt}
				<div class="flex items-center justify-between">

				<p class="flex gap-2 text-sm items-center text-muted-foreground mb-1">
									<Clock class="h-4 w-4 text-muted-foreground" />
									Time Remaining
								</p>

								<CountdownCircle expiresAt={offer.expiresAt} compact />
				</div>
				{/if}

				<!-- Description -->
				{#if offer.description}
					<div class="pt-2 border-t">
						<p class="text-xs text-muted-foreground mb-1">Description</p>
						<p class="text-sm">{offer.description}</p>
					</div>
				{/if}
			</CardContent>
		</Card>


		<!-- Countdown Timer -->

		<!-- Earnings Card (Highlighted) -->
		<Card class="border-primary bg-primary/5">
			<CardContent>
				<div class="text-center ">
					<p class="flex gap-2 items-center justify-center">
						<TrendingUp class="h-5 w-5 text-primary" />
						You Will Earn
					</p>
					<p class="text-4xl font-bold text-primary">{formatSats(takerFee+offer.satsAmount)} sats</p>
					<p class="text-sm text-muted-foreground mt-2">
						Earn this fee for completing the transaction
					</p>
				</div>
			</CardContent>
		</Card>

		<!-- Offer Details Card -->
		
		<!-- Bond Requirement Card -->
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2 text-lg">
					<Shield class="h-5 w-5" />
					Security Deposit Required
				</CardTitle>
			</CardHeader>
			<CardContent class="space-y-3">
				<div class="text-center py-2">
					<p class="text-3xl font-bold">{formatSats(takerBond)} sats</p>
				</div>
				<Alert>
					<AlertDescription class="text-sm">
						This is a refundable security deposit to ensure transaction completion. 
						You'll get it back when the transaction is successfully completed.
					</AlertDescription>
				</Alert>
				
				<!-- Balance Check -->
				{#if !hasEnoughBalance}
					<Alert variant="destructive">
						<AlertCircle class="h-4 w-4" />
						<AlertDescription class="text-sm">
							Insufficient balance. You have {formatSats(wallet.balance)} sats, 
							but need {formatSats(takerBond)} sats.
						</AlertDescription>
					</Alert>
				{/if}
			</CardContent>
		</Card>

		<!-- Session Check -->
		{#if !hasActiveSession}
			<Alert variant="destructive">
				<AlertCircle class="h-4 w-4" />
				<AlertDescription>
					You need an active session to claim offers. Please create a session first.
				</AlertDescription>
			</Alert>
		{/if}

		<!-- Action Buttons -->
		<div class="flex gap-3 pt-2">
			<Button 
				variant="outline" 
				class="flex-1"
				onclick={handleBack}
				disabled={isClaimingOffer}
			>
				Cancel
			</Button>
			<Button 
				class="flex-1"
				onclick={handleClaimOffer}
				disabled={!hasActiveSession || !hasEnoughBalance || isClaimingOffer}
			>
				{#if isClaimingOffer}
					<div class="flex items-center gap-2">
						<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
						Claiming...
					</div>
				{:else}
					Claim Offer
				{/if}
			</Button>
		</div>
	{/if}
</div>
