<script lang="ts">
	import { page } from '$app/state';
	import { dataStore } from '$lib/stores/session/data.svelte';
	import { onMount } from 'svelte';
	import type { Offer } from '@openPleb/common/db/schema';
	import { checkIfRedeemed } from '$lib/actions';
	import DetailReceipt from '../pay/components/DetailReceipt.svelte';

    interface Props {offer: Offer}
    
    let {offer}: Props = $props();

	let receipt = $derived(dataStore.receipts.find((r) => r.offerId === offer.id));
	let claim = $derived(dataStore.claims.find((c) => c.offerId === offer.id));
	onMount(() => {
		if (!receipt) {
			dataStore.fetchForId(page.params.id);
		}
	});
	$inspect(receipt);

	$effect(() => {
		if (claim?.reward) {
			checkIfRedeemed(claim?.reward);
		}
	})
</script>

{#if receipt}
	<DetailReceipt {offer} {receipt}></DetailReceipt>
{/if}
