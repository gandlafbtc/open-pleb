<script lang="ts">
	import type { Offer } from 'common/db/schema';
	import { calcMakerBondForOffer, calcMakerTotalForOffer } from 'common/calc';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import type { CocoWallet } from '$lib/state/wallet/wallet.svelte';
	import { offerService } from '$lib/interface/rest/offer.service';
	import { getEncodedToken } from 'coco-cashu-core';
	import { walletView } from '$lib/state/walletView.svelte';
	import { ensureError } from 'common/errors';
	import { LoaderCircle } from '@lucide/svelte';

	let wallet = $state<CocoWallet | undefined>(undefined);
	let isLoadingTopup = $state(false)

	interface Props {
		offer: Offer;
	}

	let { offer }: Props = $props();
	
	onMount(async () => {
		const { wallet: w } = await import('$lib/state/wallet/wallet.svelte');
		wallet = w;
	});

	const handleTopup = async () => {
	try {
		isLoadingTopup = true
		const res = await wallet?.receiveLn(totalRequired - (wallet?.balance??0))
		walletView.open()
	} catch (error) {
		const err = ensureError(error)
		console.error(err)
		toast.error(err.message)
	}	
	finally {
		isLoadingTopup=false
	}

	}
	// Calculate total amount needed (bond + escrow amount)
	const makerBondAmount = $derived(calcMakerBondForOffer(offer))
	const totalRequired = $derived(calcMakerTotalForOffer(offer));
	
	// Check if wallet has sufficient balance
	const hasSufficientBalance = $derived((wallet?.balance??0) >= totalRequired);
	
	let isProcessing = $state(false);
	
	async function handlePayAndList() {
		if (!hasSufficientBalance) {
			toast.error('Insufficient balance');
			return;
		}
		
		isProcessing = true;
		try {
			if (!wallet) {
				toast.warning('Waiting for wallet initialization. Try again')
				return
			}
			
			// 1. Create ecash token for the bond + escrow
			const {token} = await wallet.sendEcash(totalRequired)
			
			// 2. Send it to the backend to pay and list the offer
			await offerService.payAndListOffer(offer.id, getEncodedToken(token));
			
			// 3. Backend updates offer status to INVOICE_PAID and stores the ecash
			toast.success('Offer paid and listed successfully!');
		} catch (error) {
			console.error('Failed to pay and list offer:', error);
			toast.error(error instanceof Error ? error.message : 'Failed to pay and list offer');
		} finally {
			isProcessing = false;
		}
	}
</script>

<div class="space-y-4">
	<div class="text-center">
		<h3 class="text-lg font-semibold mb-2">Ready to List Your Offer</h3>
		<p class="text-sm text-muted-foreground">
			To list your offer, you need to pay the bond and escrow amount
		</p>
	</div>
	
	<div class="bg-muted rounded-lg p-4 space-y-2">
		<div class="flex justify-between text-sm">
			<span>Escrow Amount:</span>
			<span class="font-medium">{offer.satsAmount} sats</span>
		</div>
		<div class="flex justify-between text-sm">
			<span>Maker Bond:</span>
			<span class="font-medium">{makerBondAmount} sats</span>
		</div>
		<div class="border-t border-border pt-2 flex justify-between font-semibold">
			<span>Total Required:</span>
			<span>{totalRequired} sats</span>
		</div>
	</div>
	
	<div class="bg-muted rounded-lg p-4">
		<div class="flex justify-between text-sm">
			<span>Your Balance:</span>
			<span class="font-medium" class:text-destructive={!hasSufficientBalance}>
				{wallet?.balance??0} sats
			</span>
		</div>
	</div>
	
	{#if !hasSufficientBalance}
		<div class="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
			<p class="text-sm text-destructive font-medium">
				Insufficient balance. You need {totalRequired - (wallet?.balance??0)} more sats. 
				{#if isLoadingTopup}
				  <LoaderCircle class="animate-spin"></LoaderCircle>
				{:else}
				  
				<Button variant="link" onclick={handleTopup}>Top Up now</Button>
				{/if}
			</p>
		</div>
	{/if}
	
	<Button
		onclick={handlePayAndList}
		disabled={!hasSufficientBalance || isProcessing}
		class="w-full"
		size="lg"
	>
		{#if isProcessing}
			Processing...
		{:else}
			Pay {totalRequired} sats and List Offer
		{/if}
	</Button>
</div>
