<script lang="ts">
	import { page } from '$app/state';
	import { dataStore } from '$lib/stores/session/data.svelte';
	import { Calendar, FileImage, LoaderCircle, User } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import type { Offer } from '@openPleb/common/db/schema';
	import Expiry from '$lib/elements/Expiry.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { formatCurrency } from '$lib/helper';
	import DetailOffer from '../../pages/pay/components/DetailOffer.svelte';
	import DetailReceipt from '../pay/components/DetailReceipt.svelte';

	interface Props {
		offer: Offer;
	}

	let { offer }: Props = $props();

	let receipt = $derived(dataStore.receipts.find((r) => r.offerId === offer.id));
	onMount(() => {
		if (!receipt) {
			dataStore.fetchForId(page.params.id);
		}
	});

	// Format date from unix timestamp
	const formatDate = (timestamp: number | undefined) => {
		if (!timestamp) return 'N/A';
		return new Date(timestamp * 1000).toLocaleString();
	};
</script>

{#if receipt || offer.receiptSkipped}
	<div class="flex w-full flex-col items-center justify-center gap-4 text-center">
		{#if receipt}
			<p class="text-lg font-bold">Receipt uploaded successfully!</p>
			<p class="flex items-center gap-2 text-sm text-muted-foreground">
				Waiting for approval...
				<LoaderCircle class="h-4 w-4 animate-spin"></LoaderCircle>
			</p>
		{:else}
			<p class="text-lg font-bold">Receipt upload skipped</p>
			<p class="text-sm text-muted-foreground">
				Operators will review the payment details shortly.
			</p>
		{/if}
		<DetailReceipt {offer} receipt={receipt ?? null}></DetailReceipt>
	</div>
{:else}
	<div class="flex justify-center p-6 text-muted-foreground">
		<LoaderCircle class="h-6 w-6 animate-spin" />
	</div>
{/if}
