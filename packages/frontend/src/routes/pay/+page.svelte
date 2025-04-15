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
	import Dropzone from 'svelte-file-dropzone';
	import { decodeQR } from 'qr/decode.js';
	import QrScanner from 'qr-scanner';
	import { keysStore } from 'cashu-wallet-engine';

	let isScanning = $state(true);
	let scannedResult = $state('');
	let manualInput = $state('');
	let amount = $state(0);
	let isLoading = $state(false);

	let file = $state('');
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
		<div class="relative flex w-full items-center py-5">
			<div class="flex-grow border-t border-muted"></div>
			<span class="mx-4 flex-shrink text-muted-foreground">OR</span>
			<div class="flex-grow border-t border-muted"></div>
		</div>
		<div class="flex w-full justify-between gap-2">
			<div class="flex w-full flex-col gap-2">
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
			<div class="w-0 border border-muted"></div>
			<div class="h-full w-full">
				<Dropzone
					containerClasses="h-full"
					accept=".png,.jpg,.jpeg"
					multiple={false}
					maxSize={1024 * 1024 * 5}
					on:drop={async (e) => {
						const uploadedFile = e.detail.acceptedFiles[0];

						file = URL.createObjectURL(uploadedFile);
						const reader = new FileReader();
						const blob = await (await fetch(file)).blob();
						const img = await getImgMeta(file);

						try {
							// Decode QR from the file
							const result = await QrScanner.scanImage(blob, {});
							console.log(result);
							scannedResult = result;
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
		<div class="flex flex-col items-center gap-2">
			<p class="text-xl font-bold">
				{formatCurrency(amount, 'KRW')}
			</p>
			<p class="w-80 overflow-clip text-ellipsis text-muted-foreground lg:w-[600px]">
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
