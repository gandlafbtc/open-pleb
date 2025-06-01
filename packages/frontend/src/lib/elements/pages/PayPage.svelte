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
	import SelectProvider from '../SelectProvider.svelte';
	import type { FiatProvider } from '@openPleb/common/db/schema';
	import * as Card from '$lib/components/ui/card/index.js';

	const {OPENPLEB_BOND_FLAT_RATE, OPENPLEB_BOND_PERCENTAGE, OPENPLEB_CURRENCY, OPENPLEB_PLATFORM_FEE_FLAT_RATE, OPENPLEB_PLATFORM_FEE_PERCENTAGE, OPENPLEB_TAKER_FEE_FLAT_RATE, OPENPLEB_TAKER_FEE_PERCENTAGE } = dataStore.env;

	let isScanning = $state(true);
	let scannedResult = $state('');
	let manualInput = $state('');
	let amount = $state(0);
	let satsAmount = $derived(Math.ceil((100000000 / $priceStore) * amount))
	let estimate = $derived(satsAmount + OPENPLEB_PLATFORM_FEE_FLAT_RATE + OPENPLEB_TAKER_FEE_FLAT_RATE + (satsAmount*0.01*OPENPLEB_TAKER_FEE_PERCENTAGE) + (satsAmount*0.01*OPENPLEB_PLATFORM_FEE_PERCENTAGE))
	let bondEstimate = $derived(satsAmount*0.01*OPENPLEB_BOND_PERCENTAGE+OPENPLEB_BOND_FLAT_RATE)
	let isLoading = $state(false);
	let provider: FiatProvider | undefined = $state();

	let file = $state('');
	const createOffer = async () => {
		try {
			isLoading = true;
			toast.promise(
				createNewOffer({ amount: amount, qrCode: scannedResult, pubkey: $keysStore[0].publicKey, fiatProviderId: provider?.id   }),
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
		<Card.Root class="w-full">
			<Card.Header>
				<Card.Title>Scan QR Code</Card.Title>
				<Card.Description>Scan a QR code, enter address manually, or upload an image</Card.Description>
			</Card.Header>
			<Card.Content>
					<SimpleScanner bind:isScanning whatToScan="FIAT" bind:scannedResult></SimpleScanner>
				<div class="relative flex w-full items-center py-3">
					<div class="flex-grow border-t border-muted"></div>
					<span class="mx-4 flex-shrink text-muted-foreground">OR</span>
					<div class="flex-grow border-t border-muted"></div>
				</div>
			</Card.Content>
			<Card.Footer class="flex flex-col gap-4">
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
			</Card.Footer>
		</Card.Root>
	{:else if scannedResult}
		<Card.Root class="w-full">
			<Card.Header class="text-center">
				<Card.Title class="text-xl">Offer Details</Card.Title>
				<Card.Description>Enter the amount you want to pay</Card.Description>
				
				<div class="flex flex-col items-center gap-3 mt-4 p-3 bg-secondary/40 rounded-lg">
					<div class="flex flex-col items-center">
						<p class="text-4xl font-bold text-primary">
							{formatCurrency(amount || 0, OPENPLEB_CURRENCY)}
						</p>
						<div class="flex items-center gap-2 mt-1">
							<div class="h-1.5 w-1.5 rounded-full bg-muted-foreground"></div>
							<p class="font-medium text-muted-foreground">
								~ {formatCurrency(estimate, 'SAT')}
							</p>
							<div class="h-1.5 w-1.5 rounded-full bg-muted-foreground"></div>
						</div>
					</div>
					
					<div class="flex items-center gap-2 px-3 py-1 bg-accent rounded-full">
						<p class="text-sm font-semibold text-accent-foreground">
							+ {formatCurrency(bondEstimate, 'SAT')} Bond
						</p>
					</div>
				</div>
				
				<div class="mt-3 px-4 py-2 bg-secondary/20 rounded-md max-w-full">
					<p class="text-sm overflow-hidden text-ellipsis break-all text-center text-muted-foreground">
						To: {scannedResult}
					</p>
				</div>
			</Card.Header>
			
			<Card.Content class="w-full">
				<SelectProvider bind:provider matchAddress={scannedResult}></SelectProvider>
			</Card.Content>
			
			<Card.Footer class="flex flex-col gap-4">
				<form
					class="w-full"
					onsubmit={(e) => {
						e.preventDefault();
						createOffer();
					}}
				>
					<div class="flex w-full flex-col gap-3">
						<Input 
							type="number" 
							placeholder="Enter amount here" 
							bind:value={amount}
							class="text-center font-medium" 
						/>
						<FormButton 
							type="submit" 
							value="Pay" 
							disabled={!amount}
							class="font-semibold"
						>
							Create offer (~ {formatCurrency(estimate+bondEstimate, 'SAT')})
						</FormButton>
					</div>
				</form>
			</Card.Footer>
		</Card.Root>
		<Button
			variant="outline"
			class="mt-4"
			onclick={() => {
				scannedResult = '';
				isScanning = true;
			}}
			disabled={isLoading}>
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
			Back to Scanner
		</Button>
	{/if}
</div>
