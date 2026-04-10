<script lang="ts">
	import { offerService } from '$lib/interface/rest/offer.service';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import * as Accordion from '$lib/components/ui/accordion';
	import { env } from '$lib/state/dynamic/env.svelte';
	import { exchangeRate } from '$lib/state/dynamic/exchangerate.svelte';
	import { SATS_PER_BTC } from 'common/const';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { ChevronLeft } from '@lucide/svelte';
	import { providerStore } from '$lib/state/persistent/db/repos/provider';

	interface Props {
		fiatAmountCents: string;
		fiatAddress: string;
		fiatProviderId: string;
		description: string;
		sessionId: string;
		onBack: () => void;
	}

	let { fiatAmountCents, fiatAddress, fiatProviderId, description, sessionId, onBack }: Props = $props();

	let isLoading = $state(false);



	// Determine if currency uses decimals (most do, except KRW, JPY, etc.)
	const currencyUsesDecimals = $derived.by(() => {
		const currency = env.settings?.OPENPLEB_CURRENCY || 'USD';
		const noDecimalCurrencies = ['KRW', 'JPY', 'VND', 'IDR'];
		return !noDecimalCurrencies.includes(currency);
	});

	// Format amount based on currency
	const displayAmount = $derived.by(() => {
		if (!fiatAmountCents) return '0';
		const amount = parseInt(fiatAmountCents);
		if (isNaN(amount)) return '0';
		
		if (currencyUsesDecimals) {
			// For currencies with decimals, divide by 100 (cents to dollars/euros)
			return (amount / 100).toFixed(2);
		} else {
			// For currencies without decimals (like KRW), display as-is
			return amount.toString();
		}
	});

	const currency = $derived(env.settings?.OPENPLEB_CURRENCY || 'USD');

	const providerLabel = $derived.by(() => {
		if (!fiatProviderId) return 'Not specified';
		const provider = providerStore.data.find(p => p.id === parseInt(fiatProviderId));
		return provider ? provider.label : 'Unknown';
	});

	// Calculate sats amount from fiat
	const satsAmount = $derived.by(() => {
		if (!fiatAmountCents || !exchangeRate.rate) return 0;
		const amountCents = parseInt(fiatAmountCents);
		if (isNaN(amountCents)) return 0;
		
		const fiatAmount = currencyUsesDecimals ? amountCents / 100 : amountCents;
		// Convert fiat to BTC, then to sats
		const btcAmount = fiatAmount / exchangeRate.rate;
		return Math.round(btcAmount * SATS_PER_BTC);
	});

	// Calculate fees
	const feeAmount = $derived.by(() => {
		if (!env.settings || !satsAmount) return 0;
		const percentageFee = (satsAmount * (env.settings.OPENPLEB_PLATFORM_FEE_PERCENTAGE + env.settings.OPENPLEB_TAKER_FEE_PERCENTAGE)) / 100;
		const flatFee = env.settings.OPENPLEB_PLATFORM_FEE_FLAT_RATE + env.settings.OPENPLEB_TAKER_FEE_FLAT_RATE;
		return Math.round(percentageFee + flatFee);
	});

	// Calculate bonds
	const bondAmount = $derived.by(() => {
		if (!env.settings || !satsAmount) return 0;
		const percentageBond = (satsAmount * env.settings.OPENPLEB_BOND_PERCENTAGE) / 100;
		const flatBond = env.settings.OPENPLEB_BOND_FLAT_RATE;
		return Math.round(percentageBond + flatBond);
	});

	// Calculate total
	const totalAmount = $derived.by(() => {
		return satsAmount + feeAmount + bondAmount;
	});

	// Format numbers with thousand separators
	function formatNumber(num: number): string {
		return num.toLocaleString();
	}

	async function handleConfirm() {
		if (!sessionId) {
			toast.error('No active session');
			return;
		}

		isLoading = true;
		try {
			// Convert to currency unit based on whether it uses decimals
			const amountCents = parseInt(fiatAmountCents);
			const fiatAmount = currencyUsesDecimals ? amountCents / 100 : amountCents;
			
			const offer = await offerService.createOffer({
				sessionId,
				fiatAmount,
				fiatProviderId: parseInt(fiatProviderId),
				fiatAddress: fiatAddress.trim(),
				description: description.trim() || undefined
			});

			if (offer) {
				toast.success('Offer created successfully!');
				goto(resolve(`/offer/${offer.id}`));
			} else {
				toast.error('Failed to create offer');
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create offer';
			toast.error(errorMessage);
			console.error(error);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="space-y-6">
	<Card>
		<CardHeader>
			<CardTitle>Review Your Offer</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<!-- Amount Display -->
			<div class="space-y-1">
				<p class="text-sm text-muted-foreground mb-1">Amount</p>
				<p class="text-3xl font-bold">{displayAmount} {currency}</p>
			</div>

			<!-- Payment Address -->
			<div class="space-y-1">
				<p class="text-sm font-medium text-muted-foreground">Payment Address</p>
				<p class="text-base break-all">{fiatAddress}</p>
			</div>

			<!-- Payment Method Provider -->
			<div class="space-y-1">
				<p class="text-sm font-medium text-muted-foreground">Payment Method</p>
				<p class="flex gap-2 items-center text-base">
					<img src={providerStore.getProviderById(parseInt(fiatProviderId))?.icon} class="w-4 h-4" alt="">
					{providerLabel}</p>
			</div>

			<!-- Description -->
			{#if description.trim()}
				<div class="space-y-1">
					<p class="text-sm font-medium text-muted-foreground">Description</p>
					<p class="text-base whitespace-pre-wrap">{description}</p>
				</div>
			{/if}

			<!-- Divider -->
			<div class="border-t my-4"></div>

			<!-- Estimated Costs Section -->
			<div class="space-y-3">
				<h3 class="text-sm font-semibold">Estimated Costs</h3>
				
				{#if exchangeRate.rate && env.settings}
					<!-- Sats Amount -->
					<div class="flex justify-between items-center">
						<span class="text-sm text-muted-foreground">Sats Amount</span>
						<span class="font-semibold">{formatNumber(satsAmount)} sats</span>
					</div>

					<!-- Fees -->
					<div class="flex justify-between items-center">
						<span class="text-sm text-muted-foreground">Fees</span>
						<span class="font-semibold">{formatNumber(feeAmount)} sats</span>
					</div>

					<!-- Bonds -->
					<div class="flex justify-between items-center">
						<span class="text-sm text-primary/80">Bonds (refundable)</span>
						<span class="font-semibold text-primary/80">{formatNumber(bondAmount)} sats</span>
					</div>

					<!-- Divider -->
					<div class="border-t pt-3"></div>

					<!-- Total -->
					<div class="flex justify-between items-center">
						<span class="font-semibold">Total</span>
						<span class="text-xl font-bold text-primary">{formatNumber(totalAmount)} sats</span>
					</div>

					<!-- Expandable Details -->
					<Accordion.Root type="single" class="w-full">
						<Accordion.Item value="details" class="border-none">
							<Accordion.Trigger class="text-xs text-muted-foreground hover:no-underline py-2">
								Show details
							</Accordion.Trigger>
							<Accordion.Content>
								<div class="space-y-2 pt-2">
									<!-- Fee Breakdown -->
									<div class="space-y-1">
										<p class="text-xs font-medium text-muted-foreground">Fee Breakdown:</p>
										<div class="flex justify-between text-xs pl-2">
											<span class="text-muted-foreground">Platform Fee</span>
											<span>{env.settings.OPENPLEB_PLATFORM_FEE_PERCENTAGE}% + {env.settings.OPENPLEB_PLATFORM_FEE_FLAT_RATE} sats</span>
										</div>
										<div class="flex justify-between text-xs pl-2">
											<span class="text-muted-foreground">Taker Fee</span>
											<span>{env.settings.OPENPLEB_TAKER_FEE_PERCENTAGE}% + {env.settings.OPENPLEB_TAKER_FEE_FLAT_RATE} sats</span>
										</div>
									</div>

									<!-- Bond Breakdown -->
									<div class="space-y-1">
										<p class="text-xs font-medium text-muted-foreground">Bond Breakdown:</p>
										<div class="flex justify-between text-xs pl-2">
											<span class="text-muted-foreground">Bond</span>
											<span>{env.settings.OPENPLEB_BOND_PERCENTAGE}% + {env.settings.OPENPLEB_BOND_FLAT_RATE} sats</span>
										</div>
									</div>

									<!-- Exchange Rate -->
									<div class="text-xs text-muted-foreground pt-2">
										Exchange Rate: {exchangeRate.rate.toLocaleString()} {currency}/BTC
									</div>
								</div>
							</Accordion.Content>
						</Accordion.Item>
					</Accordion.Root>
				{:else}
					<p class="text-sm text-muted-foreground text-center">Loading exchange rate...</p>
				{/if}
			</div>

			<!-- Action Buttons -->
			<div class="flex gap-3 justify-end pt-4">
				<Button type="button" variant="outline" onclick={onBack} disabled={isLoading}>
					<ChevronLeft></ChevronLeft>
					Edit
				</Button>
				<Button type="button" onclick={handleConfirm} disabled={isLoading}>
					{isLoading ? 'Creating...' : 'Confirm & Create'}
				</Button>
			</div>
		</CardContent>
	</Card>
</div>
