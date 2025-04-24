<script lang="ts">
	import { page } from '$app/state';
	import { dataStore } from '$lib/stores/session/data.svelte';
	import { onMount } from 'svelte';
	import type { Offer } from '@openPleb/common/db/schema';
	import { checkIfRedeemed } from '$lib/actions';

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
	<div class="flex flex-col items-center justify-center gap-2">
		<p class="font-bold">Transaction complete!</p>
		<img src={receipt.receiptImg} alt="" />
	</div>
{/if}
