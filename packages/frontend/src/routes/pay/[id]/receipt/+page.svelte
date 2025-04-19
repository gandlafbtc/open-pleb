<script lang="ts">
	import { page } from '$app/state';
	import { PUBLIC_API_VERSION, PUBLIC_BACKEND_URL } from '$env/static/public';
	import Button from '$lib/components/ui/button/button.svelte';
	import { dataStore } from '$lib/stores/session/data.svelte';
	import { OFFER_STATE } from '@openPleb/common/types';
	import { LoaderCircle } from 'lucide-svelte';
	import { schnorr } from '@noble/curves/secp256k1';
	import { toast } from 'svelte-sonner';
	import { sha256 } from '@noble/hashes/sha256';
	import { bytesToHex } from '@noble/hashes/utils';
	import { ensureError } from '$lib/errors';
	import { keysStore } from 'cashu-wallet-engine';
	import Expiry from '$lib/elements/Expiry.svelte';
	let showFullScreen = $state(false);
	let isOpen = $state(false);
	const id = Number.parseInt(page.params.id);
	const receipt = $derived(dataStore.receipts.find((r) => r.offerId === id));
	const offer = $derived(dataStore.offers.find((o) => o.id === id));
	$inspect(receipt);

	let isLoading = $state(false);

	const markPaymentFailed = async () => {
		await commitFeedback('Payment failed', OFFER_STATE.MARKED_WITH_ISSUE);
	};

	const markPaymentSucceeded = async () => {
		await commitFeedback('Payment completed', OFFER_STATE.COMPLETED);
	};

	const commitFeedback = async (feedback: string, status: string) => {
		try {
			if (!offer) {
				toast.warning('Offer not found');
				return;
			}
			const nonce = bytesToHex(schnorr.utils.randomPrivateKey());
			const message = nonce + feedback + status + offer.id + offer.invoice;
			const messageHash = sha256(message);
			const signature = bytesToHex(schnorr.sign(messageHash, $keysStore[0].privateKey));
			isLoading = true;
			const res = await fetch(
				`${PUBLIC_BACKEND_URL}/api/${PUBLIC_API_VERSION}/offers/${offer?.id}/feedback`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						nonce,
						signature,
						status,
						feedback
					})
				}
			);
			if (!res.ok) {
				throw new Error(await res.text());
			}
			const data = await res.json();
		} catch (error) {
			const err = ensureError(error);
			console.error(err);
			toast.error(err.message);
		} finally {
			isLoading = false;
		}
	};
</script>

<div>
	{#if offer}
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
				{#if offer.status === OFFER_STATE.COMPLETED}
					Offer completed! Thank you for using openPleb.
				  
				{:else if offer.status === OFFER_STATE.MARKED_WITH_ISSUE}
					This offer has been flagged as unresolved. It will be reviewed by a moderator.
				{:else}
					<div class="flex w-full flex-col items-center gap-2">
						<Button disabled={isLoading} class="w-full" onclick={markPaymentSucceeded}>
							If the payment was successful, click here!
						</Button>
						<Button disabled={isLoading} class="w-full" variant="link" onclick={markPaymentFailed}>
							Someting went wrong with the payment
						</Button>
					</div>
				{/if}
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
		{:else}
			<Expiry {offer}></Expiry>
			<div class="flex flex-col items-center gap-2">
				<p>
					Waiting for receipt... {offer?.status}
				</p>
				{#if offer.status === OFFER_STATE.EXPIRED}
					<div class="flex flex-col items-center gap-2">
						<p>Offer expired.</p>
						<div class="flex w-full flex-col items-center gap-10">
							<Button
								disabled={isLoading}
								variant="outline"
								class="w-full"
								onclick={markPaymentSucceeded}
							>
								If the payment was successful, click here!
							</Button>
							<Button disabled={isLoading} class="w-full" onclick={markPaymentFailed}>
								Someting went wrong with the payment
							</Button>
						</div>
					</div>
				{:else}
					<LoaderCircle class="animate-spin"></LoaderCircle>
				{/if}
			</div>
		{/if}
	{:else}{/if}
</div>
