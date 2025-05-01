<script lang="ts">
	import { page } from '$app/state';
	import { dataStore } from '$lib/stores/session/data.svelte';
	import { LoaderCircle } from 'lucide-svelte';
	import { OFFER_STATE } from '@openPleb/common/types';
	import PayCreatedPage from '$lib/elements/pages/pay/PayCreatedPage.svelte';
	import PayInvoiceCreatedPage from '$lib/elements/pages/pay/PayInvoiceCreatedPage.svelte';
	import PayInvoicePaidPage from '$lib/elements/pages/pay/PayInvoicePaidPage.svelte';
	import PayClaimedPage from '$lib/elements/pages/pay/PayClaimedPage.svelte';
	import PayReceiptSubmittedPage from '$lib/elements/pages/pay/PayReceiptSubmittedPage.svelte';
	import PayCompletedPage from '$lib/elements/pages/pay/PayCompletedPage.svelte';
	import PayMarkedWithIssuePage from '$lib/elements/pages/pay/PayMarkedWithIssuePage.svelte';
	import PayDisputedPage from '$lib/elements/pages/pay/PayDisputedPage.svelte';
	import PayResolvedPage from '$lib/elements/pages/pay/PayResolvedPage.svelte';
	import PayErrorPage from '$lib/elements/pages/pay/PayErrorPage.svelte';
	import PayExpiredPage from '$lib/elements/pages/pay/PayExpiredPage.svelte';
	import Expiry from '$lib/elements/Expiry.svelte';
	const id = Number.parseInt(page.params.id);
	const offer = $derived(dataStore.offers.find((o) => o.id === id));

	const totalSats = $derived.by(() => {
		if (!offer) {
			return null;
		}
		const total =
			offer.satsAmount +
			offer.platformFeePercentage +
			offer.takerFeePercentage +
			offer.platformFeeFlatRate +
			offer.takerFeeFlatRate;

		return total;
	});
	const bondTotalSats = $derived.by(() => {
		if (!offer) {
			return null;
		}
		const total = offer.bondPercentage + offer.bondFlatRate;
		return total;
	});
</script>
<div class="w-80 xl:w-[600px] p-2">
{#if offer && totalSats && bondTotalSats}
	{#if offer.status === OFFER_STATE.CREATED}
		<PayCreatedPage {offer} {totalSats} {bondTotalSats}></PayCreatedPage>
	{:else if offer.status === OFFER_STATE.INVOICE_CREATED}
		<PayInvoiceCreatedPage {offer}></PayInvoiceCreatedPage>
	{:else if offer.status === OFFER_STATE.INVOICE_PAID}
		<PayInvoicePaidPage {offer}></PayInvoicePaidPage>
	{:else if offer.status === OFFER_STATE.CLAIMED}
		<PayClaimedPage {offer}></PayClaimedPage>
	{:else if offer.status === OFFER_STATE.RECEIPT_SUBMITTED}
		<PayReceiptSubmittedPage {offer}></PayReceiptSubmittedPage>
	{:else if offer.status === OFFER_STATE.COMPLETED}
		<PayCompletedPage {offer}></PayCompletedPage>
	{:else if offer.status === OFFER_STATE.MARKED_WITH_ISSUE}
		<PayMarkedWithIssuePage {offer}></PayMarkedWithIssuePage>
	{:else if offer.status === OFFER_STATE.DISPUTED}
		<PayDisputedPage {offer}></PayDisputedPage>
	{:else if offer.status === OFFER_STATE.RESOLVED}
		<PayResolvedPage {offer}></PayResolvedPage>
	{:else if offer.status === OFFER_STATE.ERROR}
		<PayErrorPage {offer}></PayErrorPage>
	{:else if offer.status === OFFER_STATE.EXPIRED}
		<PayExpiredPage {offer}></PayExpiredPage>
	{:else}
		unknown status
	{/if}
{:else}
	<LoaderCircle class="animate-spin"></LoaderCircle>
{/if}
</div>