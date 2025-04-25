<script lang="ts">
	import { env} from '$env/dynamic/public';
	import Button from '$lib/components/ui/button/button.svelte';
	import { OFFER_STATE } from '@openPleb/common/types';
	import { schnorr } from '@noble/curves/secp256k1';
	import { toast } from 'svelte-sonner';
	import { sha256 } from '@noble/hashes/sha256';
	import { bytesToHex } from '@noble/hashes/utils';
	import { ensureError } from '$lib/errors';
	import {  keysStore } from '@gandlaf21/cashu-wallet-engine';
	import type { Offer } from '@openPleb/common/db/schema';
	import * as Dialog  from '$lib/components/ui/dialog';

    const { PUBLIC_API_VERSION, PUBLIC_BACKEND_URL } = env;

    interface Props {offer: Offer}
    
    let {offer}: Props = $props();

    let isLoading = $state(false)
    let isShow = $state(false)

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

<div class="flex w-full flex-col items-center gap-2">
    <Button disabled={isLoading} class="w-full" onclick={markPaymentSucceeded}>
        If the payment was successful, click here!
    </Button>
    <Button disabled={isLoading} class="w-full" variant="link" onclick={() => (isShow = true)}>
        Someting went wrong with the payment
    </Button>
</div>

<Dialog.Root bind:open={isShow}>
    <Dialog.Content>
     <Dialog.Header>
      <Dialog.Title class="text-destructive">
		Reporting Payment as failed!
	  </Dialog.Title>
      <Dialog.Description>
		You are about to report this payment as failed. It will be investigated by the operators and a decision will be made based on the evidence provided.
		If ruled against you, your bond will be forfeited.
      </Dialog.Description>
     </Dialog.Header>
	 <Dialog.Footer>
		 <Button variant="outline" disabled={isLoading} class="w-full" onclick={() => (isShow = false)}>
			 Close
		 </Button>
		 <Button disabled={isLoading} variant="destructive"  class="w-full" onclick={markPaymentFailed}>
			 Confirm Payment failure
		 </Button>
	 </Dialog.Footer>
    </Dialog.Content>
   </Dialog.Root>