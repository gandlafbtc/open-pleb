<script lang="ts">
	import { page } from '$app/state';
	import Button from '$lib/components/ui/button/button.svelte';
	import { dataStore } from '$lib/stores/session/data.svelte';
	import type { Offer } from '@openPleb/common/db/schema';
	import PaymentFeedback from './components/PaymentFeedback.svelte';


    interface Props {offer: Offer}
    
    let {offer}: Props = $props();

	let showFullScreen = $state(false);
	const id = Number.parseInt(page.params.id);
	const receipt = $derived(dataStore.receipts.find((r) => r.offerId === id));

</script>

<div>
		{#if receipt}
			<div class="flex flex-col gap-2">
				<Button
					variant="outline"
					onclick={() => {
						showFullScreen = true;
					}}
				>
					Full screen
				</Button>
				<img src={receipt.receiptImg} alt="" />
                <PaymentFeedback {offer}></PaymentFeedback>
				{#if showFullScreen}
					<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
						<!-- Close button -->
						<button
							onclick={() => {
								showFullScreen = false;
							}}
							class="absolute right-6 top-4 text-4xl text-white hover:text-gray-300">&times;</button
						>
						<img src={receipt.receiptImg} alt="" class="max-h-[100%] max-w-[100%] object-contain" />
					</div>
				{/if}
			</div>
		{/if}
</div>
