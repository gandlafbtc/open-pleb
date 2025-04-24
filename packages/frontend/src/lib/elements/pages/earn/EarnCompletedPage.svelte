<script lang="ts">
	import { page } from '$app/state';
	import { PUBLIC_MINT_URL } from '$env/static/public';
	import { ensureError } from '$lib/errors';
	import { dataStore } from '$lib/stores/session/data.svelte';
	import { getDecodedToken } from '@cashu/cashu-ts';
	import { getWalletWithUnit, keysStore, mintsStore, receiveEcash } from 'cashu-wallet-engine';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { CheckStateEnum } from "@cashu/cashu-ts";
	import type { Offer } from '@openPleb/common/db/schema';

    interface Props {offer: Offer}
    
    let {offer}: Props = $props();

	let receipt = $derived(dataStore.receipts.find((r) => r.offerId === offer.id));
	let isLoading = $state(false)
	onMount(() => {
		if (!receipt) {
			dataStore.fetchForId(page.params.id);
		}
	});
	$inspect(receipt);

	const claim = async () => {
		try {
			isLoading = true;
			await receiveEcash(receipt?.reward??'', {privkey: $keysStore[0].privateKey})
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

	const checkIfRedeemed = async (reward: string) => {
		try {
			const token = getDecodedToken(reward)
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
		if (receipt?.reward) {
			checkIfRedeemed(receipt?.reward);
		}
	})
</script>

{#if receipt}
	<div class="flex flex-col items-center justify-center gap-2">
		<p class="font-bold">Transaction complete!</p>
		<img src={receipt.receiptImg} alt="" />
	</div>
{/if}
