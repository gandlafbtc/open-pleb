<script lang="ts">
	import { env} from '$env/dynamic/public';
	import Button from '$lib/components/ui/button/button.svelte';
	import { OFFER_STATE } from '@openPleb/common/types';
	import { toast } from 'svelte-sonner';
	import { ensureError } from '$lib/errors';
	import {  keysStore } from '@gandlaf21/cashu-wallet-engine';
	import type { Offer } from '@openPleb/common/db/schema';
	import * as Dialog  from '$lib/components/ui/dialog';
	import Input from '$lib/components/ui/input/input.svelte';
	import { signPayload } from "@openPleb/common/payloads";
    const { PUBLIC_API_VERSION, PUBLIC_BACKEND_URL } = env;

    interface Props {offer: Offer}
    
    let {offer}: Props = $props();

    let isLoading = $state(false)
    let isShow = $state(false)
    let isShowSuccess = $state(false)
	let feedback = $state('');

    const markPaymentFailed = async () => {
		await commitFeedback(feedback, OFFER_STATE.MARKED_WITH_ISSUE);
	};

	const markPaymentSucceeded = async () => {
		await commitFeedback(feedback, OFFER_STATE.COMPLETED);
	};

	const commitFeedback = async (feedback: string, status: string) => {
		try {
			if (!offer) {
				toast.warning('Offer not found');
				return;
			}
			isLoading = true;
			const {nonce, signature, timestamp, payload} = signPayload({status,feedback},$keysStore[0].privateKey)
			const res = await fetch(
				`${PUBLIC_BACKEND_URL}/api/${PUBLIC_API_VERSION}/offers/${offer?.id}/feedback`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						payload,
						nonce,
						timestamp,
						signature,
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
    <Button disabled={isLoading} class="w-full" onclick={() => isShowSuccess = true}>
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
	 <Input placeholder="Feedback..." bind:value={feedback}  />

	 <Dialog.Footer>
		 <Button variant="outline" disabled={isLoading} class="w-full" onclick={() => {
			isShow = false
			feedback = ''
		}}>
			 Close
		 </Button>
		 <Button disabled={isLoading} variant="destructive"  class="w-full" onclick={markPaymentFailed}>
			 Confirm Payment failure
		 </Button>
	 </Dialog.Footer>
    </Dialog.Content>
   </Dialog.Root>

   <Dialog.Root bind:open={isShowSuccess}>
    <Dialog.Content>
     <Dialog.Header>
      <Dialog.Title class="text-green-500">
		Reporting Payment as Successful!
	  </Dialog.Title>
      <Dialog.Description>
		By marking the payment as successful, the bonds will be returned, the rewards issued and the offer finalized. There will be no recourse.
      </Dialog.Description>
     </Dialog.Header>
	 <Input placeholder="Feedback..." bind:value={feedback}  />
	 <Dialog.Footer>
		 <Button variant="outline" disabled={isLoading} class="w-full" onclick={() => {
			isShowSuccess = false
			feedback = ''
		}}>
			 Close
		 </Button>
		 <Button disabled={isLoading} class="w-full" onclick={markPaymentSucceeded}>
			 Confirm
		 </Button>
	 </Dialog.Footer>
    </Dialog.Content>
   </Dialog.Root>