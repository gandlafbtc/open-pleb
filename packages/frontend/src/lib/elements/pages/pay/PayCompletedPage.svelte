<script lang="ts">
	import { page } from '$app/state';
	import { dataStore } from '$lib/stores/session/data.svelte';
	import type { Offer } from '@openPleb/common/db/schema';
	import { checkIfRedeemed } from '$lib/actions';
	import DetailReceipt from './components/DetailReceipt.svelte';

    interface Props {offer: Offer}
    
    let {offer}: Props = $props();
	const id = Number.parseInt(page.params.id);
	const receipt = $derived(dataStore.receipts.find((r) => r.offerId === id));

	$effect(() => {
		if (offer?.refund) {
			checkIfRedeemed(offer?.refund);
		}
	})
</script> 

<div>
	{#if receipt || offer.receiptSkipped}
		<DetailReceipt {offer} receipt={receipt ?? null}></DetailReceipt>	
	{/if}
</div>
