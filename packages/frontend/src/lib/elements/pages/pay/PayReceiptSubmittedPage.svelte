<script lang="ts">
	import { page } from '$app/state';
	import { dataStore } from '$lib/stores/session/data.svelte';
	import type { Offer } from '@openPleb/common/db/schema';
	import PaymentFeedback from './components/PaymentFeedback.svelte';
import DetailReceipt from './components/DetailReceipt.svelte';
import CircleAlert from "@lucide/svelte/icons/circle-alert";
import { LoaderCircle } from 'lucide-svelte';
import * as Alert from "$lib/components/ui/alert/index.js";


    interface Props {offer: Offer}
    
    let {offer}: Props = $props();

	const id = Number.parseInt(page.params.id);
	const receipt = $derived(dataStore.receipts.find((r) => r.offerId === id));

</script>

<div>
	{#if receipt || offer.receiptSkipped}
		<div class="flex flex-col gap-2">
			<Alert.Root variant="destructive">
				<CircleAlert class="size-4" />
				<Alert.Title>How did the payment go?</Alert.Title>
				<Alert.Description>
					Give feedback to complete the offer and release your bond.
				</Alert.Description>
			</Alert.Root>

			<PaymentFeedback {offer}></PaymentFeedback>
			<DetailReceipt {offer} receipt={receipt ?? null}></DetailReceipt>
		</div>
	{:else}
		<div class="flex justify-center p-6">
			<LoaderCircle class="h-6 w-6 animate-spin text-muted-foreground" />
		</div>
	{/if}
</div>
