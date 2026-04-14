<script lang="ts">
	import { page } from '$app/state';
	import { offerState } from '$lib/state/dynamic/offer.svelte';
	import { env } from '$lib/state/dynamic/env.svelte';
	import { sessionStore } from '$lib/state/persistent/db/repos/session';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Coins, User, Clock, AlertCircle } from '@lucide/svelte';
	import CountdownCircle from '$lib/elements/offer/CountdownCircle.svelte';
	import { clock } from '$lib/state/clock.svelte';
	import { OFFER_STATE } from 'common/types';
	
	// Import maker components
	import MakerCreated from '$lib/elements/offer/maker/Created.svelte';
	import MakerInvoiceCreated from '$lib/elements/offer/maker/InvoiceCreated.svelte';
	import MakerInvoicePaid from '$lib/elements/offer/maker/InvoicePaid.svelte';
	import MakerClaimed from '$lib/elements/offer/maker/Claimed.svelte';
	import MakerReceiptSubmitted from '$lib/elements/offer/maker/ReceiptSubmitted.svelte';
	import MakerCompleted from '$lib/elements/offer/maker/Completed.svelte';
	import MakerExpired from '$lib/elements/offer/maker/Expired.svelte';
	import MakerMarkedWithIssue from '$lib/elements/offer/maker/MarkedWithIssue.svelte';
	import MakerForefeit from '$lib/elements/offer/maker/Forefeit.svelte';
	import MakerDisputed from '$lib/elements/offer/maker/Disputed.svelte';
	import MakerResolved from '$lib/elements/offer/maker/Resolved.svelte';
	import MakerError from '$lib/elements/offer/maker/Error.svelte';
	
	// Import taker components
	import TakerCreated from '$lib/elements/offer/taker/Created.svelte';
	import TakerInvoiceCreated from '$lib/elements/offer/taker/InvoiceCreated.svelte';
	import TakerInvoicePaid from '$lib/elements/offer/taker/InvoicePaid.svelte';
	import TakerClaimed from '$lib/elements/offer/taker/Claimed.svelte';
	import TakerReceiptSubmitted from '$lib/elements/offer/taker/ReceiptSubmitted.svelte';
	import TakerCompleted from '$lib/elements/offer/taker/Completed.svelte';
	import TakerExpired from '$lib/elements/offer/taker/Expired.svelte';
	import TakerMarkedWithIssue from '$lib/elements/offer/taker/MarkedWithIssue.svelte';
	import TakerForefeit from '$lib/elements/offer/taker/Forefeit.svelte';
	import TakerDisputed from '$lib/elements/offer/taker/Disputed.svelte';
	import TakerResolved from '$lib/elements/offer/taker/Resolved.svelte';
	import TakerError from '$lib/elements/offer/taker/Error.svelte';
	import { providerStore } from '$lib/state/persistent/db/repos/provider';
	import { UNKNOWN_PROVIDER } from '$lib/utils/const';

	// Get offer ID from URL params
	const offerId = $derived(parseInt(page.params.id || '0'));
	
	// Find the offer from state
	const offer = $derived(offerState.offers.find(o => o.id === offerId));
	const isLoading = $derived(offerState.isLoading);
	const currency = $derived(env.settings?.OPENPLEB_CURRENCY || 'USD');
	const sessions = $derived(sessionStore.data);
	const provider = $derived(providerStore.getProviderById(offer?.fiatProviderId??0)??UNKNOWN_PROVIDER)

	// Determine user role
	type UserRole = 'maker' | 'taker' | 'observer';
	
	const userRole = $derived.by((): UserRole => {
		if (!offer) return 'observer';
		
		const isMaker = sessions.some(s => s.sessionId === offer.makerSessionId);
		const isTaker = offer.takerSessionId && sessions.some(s => s.sessionId === offer.takerSessionId);
		
		if (isMaker) return 'maker';
		if (isTaker) return 'taker';
		return 'observer';
	});

	function isExpired(expiresAt: number | null): boolean {
		if (!expiresAt) return false;
		return clock.time > expiresAt;
	}

	function formatNumber(num: number): string {
		return num.toLocaleString();
	}

	function formatFiatAmount(amount: number): string {
		const noDecimalCurrencies = ['KRW', 'JPY', 'VND', 'IDR'];
		const usesDecimals = !noDecimalCurrencies.includes(currency);
		
		if (usesDecimals) {
			return amount.toFixed(2);
		}
		return amount.toString();
	}

	function getStatusColor(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
		switch (status.toUpperCase()) {
			case 'CREATED':
				return 'default';
			case 'INVOICE_CREATED':
			case 'INVOICE_PAID':
			case 'CLAIMED':
			case 'RECEIPT_SUBMITTED':
				return 'secondary';
			case 'COMPLETED':
				return 'outline';
			case 'EXPIRED':
			case 'ERROR':
				return 'destructive';
			default:
				return 'outline';
		}
	}

	function handleBack() {
		goto(resolve('/offer'));
	}
</script>

<div class="container mx-auto p-4 max-w-4xl flex flex-col gap-4">
	<!-- Loading State -->
	{#if isLoading}
		<div class="flex justify-center items-center py-12">
			<div class="text-center space-y-2">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
				<p class="text-muted-foreground">Loading offer...</p>
			</div>
		</div>
	{:else if !offer}
		<!-- Not Found State -->
		<Card>
			<CardContent class="flex flex-col items-center justify-center py-12 space-y-4">
				<div class="rounded-full bg-muted p-4">
					<AlertCircle class="h-12 w-12 text-muted-foreground" />
				</div>
				<div class="text-center space-y-2">
					<h3 class="text-xl font-semibold">Offer not found</h3>
					<p class="text-muted-foreground max-w-sm">
						The offer you're looking for doesn't exist or hasn't been loaded yet.
					</p>
				</div>
				<Button onclick={handleBack}>
					Back to Offers
				</Button>
			</CardContent>
		</Card>
	{:else}
		<!-- Header -->
		<div class="flex justify-between items-center">
			<h1 class="text-2xl font-bold">Offer #{offer.id}</h1>
			<div class="flex gap-2 items-center">
				<Badge variant="outline" class="text-xs">
					{userRole}
				</Badge>
				<Badge variant={getStatusColor(offer.status)} class="text-xs">
					{offer.status}
				</Badge>
			</div>
		</div>

		<!-- Main Offer Details Card -->
		<Card class='p-2'>
			<CardContent class="p-2">
				<!-- Fiat Amount -->
				<div class="flex items-center justify-between">
					<span class="text-xl font-bold">
						{formatFiatAmount(offer.fiatAmount)} {offer.fiatCurrency}
					</span>
					<p>via</p>
					<p class="flex gap-2 items-center">
						<img src={provider.icon} alt={provider.label} class="w-4
						h-4"/>
						{provider.label}
					</p>
				</div>

				<!-- Sats Amount -->
				<div class="flex items-center justify-between">
					<span class="text-sm text-muted-foreground flex items-center gap-1.5">
						<Coins class="h-3.5 w-3.5" />
						Sats
					</span>
					<span class="font-semibold">{formatNumber(offer.satsAmount)}</span>
				</div>

				<!-- Payment Address -->
				{#if offer.fiatAddress}
					<div class="flex items-center justify-between gap-2">
						<span class="text-sm text-muted-foreground flex items-center gap-1.5">
							<User class="h-3.5 w-3.5" />
							Address
						</span>
						<span class="text-xs font-mono truncate max-w-[250px]">
							{offer.fiatAddress}
						</span>
					</div>
				{/if}

				<!-- Expiration -->
				{#if offer.expiresAt}
					<div class="flex items-center justify-between">
						<span class="text-sm text-muted-foreground flex items-center gap-1.5">
							<Clock class="h-3.5 w-3.5" />
							Expires
						</span>
						<div class="flex items-center gap-2">
							{#if isExpired(offer.expiresAt)}
								<span class="text-xs text-destructive font-semibold">Expired</span>
							{:else}
								<CountdownCircle expiresAt={offer.expiresAt} compact />
							{/if}
						</div>
					</div>
				{/if}

				<!-- Description -->
				{#if offer.description}
					<div class="pt-2 border-t mt-2">
						<p class="text-xs text-muted-foreground mb-1">Description</p>
						<p class="text-sm">{offer.description}</p>
					</div>
				{/if}
			</CardContent>
		</Card>

		<!-- State-Specific Actions Card -->
		<Card>
			<CardContent class="pt-6 space-y-3">
				{#if userRole === 'maker'}
					{#if offer.status === OFFER_STATE.EXPIRED || (offer.expiresAt??0) < clock.time}
						<MakerExpired {offer} />
					{:else if offer.status === OFFER_STATE.CREATED}
						<MakerCreated {offer} />
					{:else if offer.status === OFFER_STATE.INVOICE_CREATED}
						<MakerInvoiceCreated {offer} />
					{:else if offer.status === OFFER_STATE.INVOICE_PAID}
						<MakerInvoicePaid {offer} />
					{:else if offer.status === OFFER_STATE.CLAIMED}
						<MakerClaimed {offer} />
					{:else if offer.status === OFFER_STATE.RECEIPT_SUBMITTED}
						<MakerReceiptSubmitted {offer} />
					{:else if offer.status === OFFER_STATE.COMPLETED}
						<MakerCompleted {offer} />
					{:else if offer.status === OFFER_STATE.MARKED_WITH_ISSUE}
						<MakerMarkedWithIssue {offer} />
					{:else if offer.status === OFFER_STATE.FOREFEIT}
						<MakerForefeit {offer} />
					{:else if offer.status === OFFER_STATE.DISPUTED}
						<MakerDisputed {offer} />
					{:else if offer.status === OFFER_STATE.RESOLVED}
						<MakerResolved {offer} />
					{:else if offer.status === OFFER_STATE.ERROR}
						<MakerError {offer} />
					{:else}
						<div class="text-center py-4 text-muted-foreground text-sm">
							<p>No actions available for status: <strong>{offer.status}</strong></p>
						</div>
					{/if}
				{:else if userRole === 'taker'}
					{#if offer.status === OFFER_STATE.EXPIRED || (offer.expiresAt??0) < clock.time}
						<TakerExpired {offer} />
					{:else if offer.status === OFFER_STATE.CREATED}
						<TakerCreated {offer} />
					{:else if offer.status === OFFER_STATE.INVOICE_CREATED}
						<TakerInvoiceCreated {offer} />
					{:else if offer.status === OFFER_STATE.INVOICE_PAID}
						<TakerInvoicePaid {offer} />
					{:else if offer.status === OFFER_STATE.CLAIMED}
						<TakerClaimed {offer} />
					{:else if offer.status === OFFER_STATE.RECEIPT_SUBMITTED}
						<TakerReceiptSubmitted {offer} />
					{:else if offer.status === OFFER_STATE.COMPLETED}
						<TakerCompleted {offer} />
					{:else if offer.status === OFFER_STATE.MARKED_WITH_ISSUE}
						<TakerMarkedWithIssue {offer} />
					{:else if offer.status === OFFER_STATE.FOREFEIT}
						<TakerForefeit {offer} />
					{:else if offer.status === OFFER_STATE.DISPUTED}
						<TakerDisputed {offer} />
					{:else if offer.status === OFFER_STATE.RESOLVED}
						<TakerResolved {offer} />
					{:else if offer.status === OFFER_STATE.ERROR}
						<TakerError {offer} />
					{:else}
						<div class="text-center py-4 text-muted-foreground text-sm">
							<p>No actions available for status: <strong>{offer.status}</strong></p>
						</div>
					{/if}
				{:else}
					<div class="text-center py-4 text-muted-foreground text-sm">
						<p>You are viewing this offer as an observer</p>
						<p class="text-xs mt-2">Status: <strong>{offer.status}</strong></p>
					</div>
				{/if}
			</CardContent>
		</Card>

		<!-- Additional Info Card -->
		<Card>
			<CardContent class="">
				<div class="grid grid-cols-2 gap-3 text-xs">
					<div>
						<p class="text-muted-foreground">Rate</p>
						<p class="font-mono text-sm">{offer.conversionRate}</p>
					</div>
					<div>
						<p class="text-muted-foreground">Updated</p>
						<p class="text-sm">{new Date(offer.updatedAt * 1000).toLocaleString()}</p>
					</div>
					{#if offer.paidAt}
						<div>
							<p class="text-muted-foreground">Paid</p>
							<p class="text-sm">{new Date(offer.paidAt * 1000).toLocaleString()}</p>
						</div>
					{/if}
					{#if offer.completedAt}
						<div>
							<p class="text-muted-foreground">Completed</p>
							<p class="text-sm">{new Date(offer.completedAt * 1000).toLocaleString()}</p>
						</div>
					{/if}
				</div>
			</CardContent>
		</Card>
	{/if}
</div>
