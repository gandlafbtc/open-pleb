<script lang="ts">
	import { page } from '$app/state';
	import Expiry from '$lib/elements/Expiry.svelte';
	import EarnClaimedPage from '$lib/elements/pages/earn/EarnClaimedPage.svelte';
	import EarnCompletedPage from '$lib/elements/pages/earn/EarnCompletedPage.svelte';
	import EarnCreatedPage from '$lib/elements/pages/earn/EarnCreatedPage.svelte';
	import EarnDisputedPage from '$lib/elements/pages/earn/EarnDisputedPage.svelte';
	import EarnErrorPage from '$lib/elements/pages/earn/EarnErrorPage.svelte';
	import EarnExpiredPage from '$lib/elements/pages/earn/EarnExpiredPage.svelte';
	import EarnInvoiceCreatedPage from '$lib/elements/pages/earn/EarnInvoiceCreatedPage.svelte';
	import EarnInvoicePaidPage from '$lib/elements/pages/earn/EarnInvoicePaidPage.svelte';
	import EarnMarkedWithIssuePage from '$lib/elements/pages/earn/EarnMarkedWithIssuePage.svelte';
	import EarnReceiptSubmittedPage from '$lib/elements/pages/earn/EarnReceiptSubmittedPage.svelte';
	import EarnResolvedPage from '$lib/elements/pages/earn/EarnResolvedPage.svelte';
	import { dataStore } from '$lib/stores/session/data.svelte';
	import { OFFER_STATE } from '@openPleb/common/types';

	const id = Number.parseInt(page.params.id);
	const offer = $derived(dataStore.offers.find((o) => o.id === id));

</script>

<div class="w-80 xl:w-[600px] p-2 justify-center">
{#if offer}
	{#if offer.status === OFFER_STATE.CREATED}
	<EarnCreatedPage {offer}></EarnCreatedPage>
	{:else if offer.status === OFFER_STATE.INVOICE_CREATED}
	<EarnInvoiceCreatedPage {offer}></EarnInvoiceCreatedPage>
	{:else if offer.status === OFFER_STATE.INVOICE_PAID}
	<EarnInvoicePaidPage {offer}></EarnInvoicePaidPage>
	{:else if offer.status === OFFER_STATE.CLAIMED}
	<EarnClaimedPage {offer}></EarnClaimedPage>
	{:else if offer.status === OFFER_STATE.RECEIPT_SUBMITTED}
	<EarnReceiptSubmittedPage {offer}></EarnReceiptSubmittedPage>
	{:else if offer.status === OFFER_STATE.COMPLETED}
	<EarnCompletedPage {offer}></EarnCompletedPage>
	{:else if offer.status === OFFER_STATE.MARKED_WITH_ISSUE || offer.status === OFFER_STATE.FOREFEIT}
	<EarnMarkedWithIssuePage {offer}></EarnMarkedWithIssuePage>
	{:else if offer.status === OFFER_STATE.DISPUTED}
	<EarnDisputedPage {offer}></EarnDisputedPage>
	{:else if offer.status === OFFER_STATE.RESOLVED}
	<EarnResolvedPage {offer}></EarnResolvedPage>
	{:else if offer.status === OFFER_STATE.ERROR}
	<EarnErrorPage {offer}></EarnErrorPage>
	{:else if offer.status === OFFER_STATE.EXPIRED}	
	<EarnExpiredPage {offer}></EarnExpiredPage>
	{:else}
	  unknown status
	{/if}
{/if}
</div>