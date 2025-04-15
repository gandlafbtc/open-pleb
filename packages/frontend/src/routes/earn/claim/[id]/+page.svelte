<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { PUBLIC_API_VERSION, PUBLIC_BACKEND_URL } from '$env/static/public';
	import Button from '$lib/components/ui/button/button.svelte';
	import CopiableToken from '$lib/elements/CopiableToken.svelte';
	import { ensureError } from '$lib/errors.js';
	import { formatCurrency, objectUrlToBase64 } from '$lib/helper';
	import { dataStore } from '$lib/stores/session/data';
	import { keysStore } from 'cashu-wallet-engine';
	import { LoaderCircle, Trash, Upload } from 'lucide-svelte';
	import encodeQR from 'qr';
	import Dropzone from 'svelte-file-dropzone';
	import { toast } from 'svelte-sonner';
	let isPaid = $state(false);
	let isLoading = $state(false);
	let file = $state('');

	const id = Number.parseInt(page.params.id);
	const offer = $derived($dataStore?.offers.find((o) => o.id === id));
	const upload = async () => {
		if (!file) {
			toast.error('No file selected');
			return;
		}
		if (!offer) {
			toast.error('No offer found');
			return;
		}

		isLoading = true;
		if (browser) {
			objectUrlToBase64(file, async (b64: string) => {
				try {
					const response = await fetch(
						`${PUBLIC_BACKEND_URL}/api/${PUBLIC_API_VERSION}/offers/${offer?.id}/receipt`,
						{
							method: 'POST',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify({
								pubkey: $keysStore[0]?.publicKey,
								receipt: b64
							})
						}
					);
					if (!response.ok) {
						throw new Error(await response.text());
					}
					const result = await response.json();
					console.log(result);
					toast.success('Receipt uploaded successfully!');
					goto(`/earn/claim/${result.receipt.offerId}/receipt`);
				} catch (error) {
					const err = ensureError(error);
					console.error(err);
					toast.error(err.message);
				} finally {
					isLoading = false;
				}
			});
		}
		// upload the file to the server
	};
</script>

<div>
	{#if offer}
		<div class="flex w-80 flex-col gap-2">
			{#if isPaid}
				<p class="text-center text-xl font-bold">
					Upload a screenshot of the receipt to verify the payment.
				</p>
				<div class="w-full">
					{#if file}
						<div class="relative">
							<button
								class="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-all hover:opacity-100"
								onclick={() => {
									file = '';
								}}
							>
								<Trash class="text-white "></Trash>
							</button>
							<img id="receiptImage" src={file} alt="" class="" />
						</div>
					{:else}
						<Dropzone
							containerClasses="h-full"
							accept=".png,.jpg,.jpeg"
							multiple={false}
							maxSize={1024 * 1024 * 5}
							on:drop={(e) => {
								file = URL.createObjectURL(e.detail.acceptedFiles[0]);
							}}
						>
							Click here or drop a screenshot of the receipt to upload
						</Dropzone>
					{/if}
				</div>
				<Button disabled={!file || isLoading} onclick={upload}>
					{#if isLoading}
						<LoaderCircle class="animate-spin"></LoaderCircle>
					{:else}
						<Upload></Upload>
					{/if}
					Upload
				</Button>

				<Button
					class="mt-10"
					variant="link"
					onclick={() => {
						isPaid = false;
					}}
				>
					Back
				</Button>
			{:else}
				<p class="text-center text-xl font-bold">
					Pay
					{formatCurrency(offer.amount, 'KRW')}
					to
				</p>
				<div class="w-full rounded-md border p-2">
					{@html encodeQR(offer.qrCode, 'svg')}
				</div>
				<CopiableToken token={offer.qrCode}></CopiableToken>
				<Button
					class="mt-10"
					onclick={() => {
						isPaid = true;
					}}
				>
					I paid it
				</Button>
			{/if}
		</div>
	{/if}
</div>
