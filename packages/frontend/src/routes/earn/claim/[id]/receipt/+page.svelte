<script lang="ts">
	import { page } from '$app/state';
	import CopiableToken from '$lib/elements/CopiableToken.svelte';
	import { dataStore } from '$lib/stores/session/data.svelte';
	import { Inspect, LoaderCircle, ReceiptSwissFranc } from 'lucide-svelte';
	import { onMount } from 'svelte';
	const id = Number.parseInt(page.params.id);
	let receipt = $derived(dataStore.receipts.find((r) => r.offerId === id));
	onMount(() => {
		if (!receipt) {
			dataStore.fetchForId(page.params.id);
		}
	});
	$inspect(receipt);
</script>

{#if receipt}
	<div class="flex flex-col items-center justify-center gap-2">
		<p class="font-bold">Receipt uploaded successfully!</p>

		{#if receipt.reward}
			<div class="w-80 xl:w-[600px]">
				<CopiableToken token={receipt.reward}></CopiableToken>
			</div>
		{:else}
			<p>Waiting for approval...</p>
			<LoaderCircle class="animate-spin"></LoaderCircle>
		{/if}
		<img src={receipt.receiptImg} alt="" />
	</div>
{/if}
