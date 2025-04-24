<script lang="ts">
	import { page } from '$app/state';
	import { dataStore } from '$lib/stores/session/data.svelte';
	import { LoaderCircle } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import type { Offer } from '@openPleb/common/db/schema';

    interface Props {offer: Offer}
    
    let {offer}: Props = $props();

	let receipt = $derived(dataStore.receipts.find((r) => r.offerId === offer.id));
	onMount(() => {
		if (!receipt) {
			dataStore.fetchForId(page.params.id);
		}
	});

</script>

{#if receipt}
	<div class="flex flex-col items-center justify-center gap-2">
		<p class="font-bold">Receipt uploaded successfully!</p>
			<p>Waiting for approval...</p>
			<LoaderCircle class="animate-spin"></LoaderCircle>
		<img src={receipt.receiptImg} alt="" />
	</div>
{/if}