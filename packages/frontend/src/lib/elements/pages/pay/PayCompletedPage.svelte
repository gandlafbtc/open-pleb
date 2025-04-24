<script lang="ts">
	import { page } from '$app/state';
	import { PUBLIC_MINT_URL } from '$env/static/public';
	import Button from '$lib/components/ui/button/button.svelte';
	import { dataStore } from '$lib/stores/session/data.svelte';
	import { toast } from 'svelte-sonner';
	import { ensureError } from '$lib/errors';
	import { getWalletWithUnit, keysStore, mintsStore, receiveEcash } from 'cashu-wallet-engine';
	import { getDecodedToken, CheckStateEnum } from '@cashu/cashu-ts';
	import type { Offer } from '@openPleb/common/db/schema';

    interface Props {offer: Offer}
    
	let showFullScreen = $state(false);
	const id = Number.parseInt(page.params.id);
	const receipt = $derived(dataStore.receipts.find((r) => r.offerId === id));

	let isLoading = $state(false);

	const claim = async () => {
		try {
			isLoading = true;
			await receiveEcash(receipt?.refund??'', {privkey: $keysStore[0].privateKey})
			toast.success("received!")
		} catch (error) {
			const err = ensureError(error);
					console.error(err);
					toast.error(err.message);
		}
		finally {
			isLoading = false;
		}
	}

	const checkIfRedeemed = async (refund: string) => {
		try {
			const token = getDecodedToken(refund)
			const wallet = await getWalletWithUnit($mintsStore, PUBLIC_MINT_URL, "sat")
			const states = await wallet.checkProofsStates(token.proofs);
			const spentOrPending = states.find(s=> s.state===CheckStateEnum.PENDING || s.state===CheckStateEnum.SPENT)

			if (spentOrPending) {
				toast.success("Reward already redeemed!")
				return;
			}
			claim()

		} catch (error) {
			return
		}
	}
	$effect(() => {
		if (receipt?.refund) {
			checkIfRedeemed(receipt?.refund);
		}
	})
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
				Offer completed! Thank you for using openPleb.

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
		
	{:else}{/if}
</div>
