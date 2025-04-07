<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import FormButton from '$lib/components/ui/form/form-button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import SimpleScanner from '$lib/elements/SimpleScanner.svelte';
	import { ensureError } from '$lib/errors';
	import { formatCurrency } from '$lib/helper';
	import { toast } from 'svelte-sonner';
	import { createNewOffer, type OfferResponse } from '../../actions';
	import { goto } from '$app/navigation';
	import { keysStore } from '$lib/stores/persistent/keys';
	let isScanning = $state(true);
	let scannedResult = $state('');
	let manualInput = $state('');
	let amount = $state(0);
	let isLoading = $state(false);

	const createOffer = async () => {
		try {
			isLoading = true;
			toast.promise(
				createNewOffer({ amount: amount, qrCode: scannedResult, pubkey: $keysStore[0].publicKey }),
				{
					success: (data: OfferResponse) => {
						console.log(data);
						goto(`/pay/${data.id}`);
						return 'Offer created successfully';
					},
					error: 'Failed to create offer',
					loading: 'Creating offer...'
				}
			);
		} catch (error) {
			const err = ensureError(error);
			console.error(err);
			toast.error(err.message);
		} finally {
			isLoading = false;
		}
	};
</script>

<div class="flex h-[600px] w-80 flex-col items-center justify-between gap-2 xl:w-[600px]">
	{#if !scannedResult && isScanning === true}
		<p class="font-bold">Step 1: Scan Qr Code to Pay</p>
		<SimpleScanner bind:isScanning whatToScan="zero pay" {scannedResult}></SimpleScanner>
		<Input type="text" placeholder="Manual input" bind:value={manualInput} />
		<Button
			disabled={!manualInput}
			variant="outline"
			class="w-full"
			onclick={() => {
				scannedResult = manualInput;
				manualInput = '';
			}}>Use manual input</Button
		>
	{:else if scannedResult}
		<p class="font-bold">Step 2: Enter amount to pay</p>
		<div>
			<p class="text-xl font-bold">
				{formatCurrency(amount, 'KRW')}
			</p>
		</div>
		<form
			class="w-full"
			onsubmit={(e) => {
				e.preventDefault();
				createOffer();
			}}
		>
			<div class="flex w-full flex-col gap-2">
				<Input type="number" placeholder="Amount" bind:value={amount} />
				<FormButton type="submit" value="Pay">Confirm</FormButton>
			</div>
		</form>
		<div></div>
		<Button
			variant="outline"
			onclick={() => {
				scannedResult = '';
				isScanning = true;
			}}
			disabled={isLoading}>Back</Button
		>
	{/if}
</div>
