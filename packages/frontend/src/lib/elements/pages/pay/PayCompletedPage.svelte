<script lang="ts">
	import { page } from '$app/state';
	import Button from '$lib/components/ui/button/button.svelte';
	import { dataStore } from '$lib/stores/session/data.svelte';
	import type { Offer } from '@openPleb/common/db/schema';
	import { checkIfRedeemed } from '$lib/actions';
	import DetailReceipt from './components/DetailReceipt.svelte';

    interface Props {offer: Offer}
    
    let {offer}: Props = $props();
	let showFullScreen = $state(false);
	const id = Number.parseInt(page.params.id);
	const receipt = $derived(dataStore.receipts.find((r) => r.offerId === id));

	$effect(() => {
		if (offer?.refund) {
			checkIfRedeemed(offer?.refund);
		}
	})
</script> 

<div>
		{#if receipt}
			<DetailReceipt {offer} {receipt}></DetailReceipt>	
		{/if}
</div>
