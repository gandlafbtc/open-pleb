<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import FormButton from '$lib/components/ui/form/form-button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import SimpleScanner from '$lib/elements/SimpleScanner.svelte';
	import { ensureError } from '$lib/errors';
	import { formatCurrency, getImgMeta } from '$lib/helper';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import Dropzone from 'svelte-file-dropzone';
	import QrScanner from 'qr-scanner';
	import { keysStore } from '@gandlaf21/cashu-wallet-engine';
	import { priceStore } from '$lib/stores/price';
	import { createNewOffer, type OfferResponse } from '$lib/actions';
	import { dataStore } from '$lib/stores/session/data.svelte';

	const {OPENPLEB_BOND_FLAT_RATE, OPENPLEB_BOND_PERCENTAGE, OPENPLEB_CURRENCY, OPENPLEB_PLATFORM_FEE_FLAT_RATE, OPENPLEB_PLATFORM_FEE_PERCENTAGE, OPENPLEB_TAKER_FEE_FLAT_RATE, OPENPLEB_TAKER_FEE_PERCENTAGE } = dataStore.env;

	let isScanning = $state(true);
	let scannedResult = $state('');
	let manualInput = $state('');
	let amount = $state(0);
	let satsAmount = $derived(Math.ceil((100000000 / $priceStore) * amount))
	let estimate = $derived(satsAmount + OPENPLEB_PLATFORM_FEE_FLAT_RATE + OPENPLEB_TAKER_FEE_FLAT_RATE + (satsAmount*0.01*OPENPLEB_TAKER_FEE_PERCENTAGE) + (satsAmount*0.01*OPENPLEB_PLATFORM_FEE_PERCENTAGE))
	let bondEstimate = $derived(satsAmount*0.01*OPENPLEB_BOND_PERCENTAGE+OPENPLEB_BOND_FLAT_RATE)
	let isLoading = $state(false);

	let file = $state('');
	const createOffer = async () => {
		try {
			isLoading = true;
			toast.promise(
				createNewOffer({ amount: amount, qrCode: scannedResult, pubkey: $keysStore[0].publicKey  }),
				{
					success: (data: OfferResponse) => {
						goto(`/pay/${data.id}`);
						return 'Offer created successfully';
					},
					error: (e)=> {return `Failed to create offer: ${e.message}`},
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
		<SimpleScanner bind:isScanning whatToScan="FIAT" bind:scannedResult></SimpleScanner>
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
							scannedResult = result;
							isScanning = false;
						} catch (error) {
							console.error('Error decoding QR:', error);
							toast.error('Failed to decode QR code');
						}
					}}
				>
					Use Image from storage
				</Dropzone>
			</div>
		</div>
	{:else if scannedResult}
	<div class="flex flex-col items-center gap-2">
			<p class="font-bold">Enter amount to pay</p>
			<p class="text-3xl font-bold">
				{formatCurrency(amount, OPENPLEB_CURRENCY)}
			</p>
			<p class="font-bold  text-muted-foreground">
				~ {formatCurrency(estimate, 'SAT')}
			</p>
			<p class="text text-muted-foreground font-bold">
				+ ~ {formatCurrency(bondEstimate, 'SAT')} Bond
			</p>
			<p class="overflow-clip text-ellipsis text-muted-foreground break-all ">
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
				<FormButton type="submit" value="Pay" disabled={!amount} >Create offer (~ {formatCurrency(estimate+bondEstimate, 'SAT')})</FormButton>
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
