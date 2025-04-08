<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import FormButton from '$lib/components/ui/form/form-button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import SimpleScanner from '$lib/elements/SimpleScanner.svelte';
	import { ensureError } from '$lib/errors';
	import { delay, formatCurrency, getImgMeta, objectUrlToBase64 } from '$lib/helper';
	import { toast } from 'svelte-sonner';
	import { createNewOffer, type OfferResponse } from '../../actions';
	import { goto } from '$app/navigation';
	import { keysStore } from '$lib/stores/persistent/keys';
	import Dropzone from 'svelte-file-dropzone';
	import { decodeQR } from "qr/decode.js";
	import QrScanner from 'qr-scanner';


	let isScanning = $state(true);
	let scannedResult = $state('');
	let manualInput = $state('');
	let amount = $state(0);
	let isLoading = $state(false);

	let file = $state('')
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
		<div class="relative flex py-5 items-center w-full">
			<div class="flex-grow border-t border-muted"></div>
			<span class="flex-shrink mx-4 text-muted-foreground">OR</span>
			<div class="flex-grow border-t border-muted"></div>
		</div>
		<div class="flex gap-2 justify-between w-full">

			<div class="flex flex-col gap-2 w-full">
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
	</div>
	<div class="w-0 border border-muted">

	</div>
	<div class="w-full h-full">
		
		<Dropzone containerClasses='h-full'
		accept=".png,.jpg,.jpeg"
		multiple={false}
		maxSize={1024 * 1024 * 5}
		on:drop={async (e) => {
			const uploadedFile = e.detail.acceptedFiles[0];

			file = URL.createObjectURL(uploadedFile);
			const reader = new FileReader();
			const blob =  await (await fetch(file)).blob()
			const img = await getImgMeta(file)

			try {
				// Decode QR from the file
				const result = await QrScanner.scanImage(blob, {
				})
				console.log(result)
				scannedResult = result
				isScanning = false;
			} catch (error) {
				console.error('Error decoding QR:', error);
				toast.error('Failed to decode QR code');
			}
		}}
		>
			Use Image
		</Dropzone>
	</div>
	</div>
	{:else if scannedResult}
		<p class="font-bold">Step 2: Enter amount to pay</p>
		<div class="items-center flex-col gap-2 flex">
			<p class="text-xl font-bold">
				{formatCurrency(amount, 'KRW')}
			</p>
			<p class="text-muted-foreground w-80 lg:w-[600px] overflow-clip text-ellipsis">
				To {scannedResult}
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
