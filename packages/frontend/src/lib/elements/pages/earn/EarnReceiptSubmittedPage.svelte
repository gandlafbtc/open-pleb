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

	const { offer } = $props();

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

{#if receipt}
	<div class="flex w-full flex-col items-center justify-center gap-4">
		<p class="text-lg font-bold">Receipt uploaded successfully!</p>
		<div class="flex items-center gap-2">
			<p>Waiting for approval...</p>
			<LoaderCircle class="h-5 w-5 animate-spin"></LoaderCircle>
		</div>
		<DetailReceipt {offer} {receipt}></DetailReceipt>
	</div>
{/if}
