<script lang="ts">
	import { env } from '$env/dynamic/public';
	import type { Offer } from "@openPleb/common/db/schema";
	import * as Card from '$lib/components/ui/card/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import Input from '$lib/components/ui/input/input.svelte';
	import Expiry from '$lib/elements/Expiry.svelte';
	import { toast } from 'svelte-sonner';
	import { signPayload } from '@openPleb/common/payloads';
	import { keysStore } from '@gandlaf21/cashu-wallet-engine';
	import { DISPUTE_RESPONSE } from '@openPleb/common/types';
	import { ensureError } from '$lib/errors';

	const { PUBLIC_API_VERSION, PUBLIC_BACKEND_URL } = env;

    interface Props {offer: Offer}
    
    const {offer}: Props = $props();

	let isLoading = $state(false);
	let showForfeitDialog = $state(false);
	let showDisputeDialog = $state(false);
	let response = $state('');

	const forfeit = async () => {
		await handle(DISPUTE_RESPONSE.FORFEIT, response)
	}

	const counterDispute = async () => {
		await handle(DISPUTE_RESPONSE.COUNTER, response)
	}
	
	const handle  = async (response: string, message:string) => {
		try {
			if (!offer) {
				toast.warning('Offer not found');
				return;
			}
			isLoading = true;
			const {nonce, signature, timestamp, payload} = signPayload({response,message},$keysStore[0].privateKey)
			const res = await fetch(
				`${PUBLIC_BACKEND_URL}/api/${PUBLIC_API_VERSION}/offers/${offer?.id}/counterorforfeit`,
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
			toast.success('Dispute response submitted');
		} catch (error) {
			const err = ensureError(error);
			console.error(err);
			toast.error(err.message);
		} finally {
			isLoading = false;
		}
	}
		

</script>

<div class="flex justify-center items-center p-4">
	<Card.Root class="w-full max-w-md">
		<Card.Header>
			<Card.Title class="text-amber-500">
				Dispute Opened Against You
			</Card.Title>
			<Card.Description>
				A dispute has been opened for this payment
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<p class="mb-4">
				The other party has reported an issue with this payment. You have two options:
			</p>
			<ul class="list-disc list-inside mb-4">
				<li class="mb-2">
					<span class="font-semibold">Forfeit the dispute:</span> This will return all funds and bonds to both parties and mark the offer as expired.
				</li>
				<li>
					<span class="font-semibold">Counter dispute:</span> This will escalate the issue to an administrator who will review the case. If you lose the dispute, you may forfeit your bond.
				</li>
			</ul>
			<p class="mb-4">
				Current status: <span class="font-medium">{offer?.status}</span>
			</p>
			<p class="text-sm text-muted-foreground">
				Note: Your bond is held until this dispute is resolved.
			</p>
		</Card.Content>
		<Card.Footer class="flex flex-col gap-2">
			<Button variant="outline" class="w-full" onclick={() => showForfeitDialog = true}>
				Forfeit Dispute
			</Button>
			<Button variant="default" class="w-full" onclick={() => showDisputeDialog = true}>
				Counter Dispute
			</Button>
            <Expiry {offer}></Expiry>
		</Card.Footer>
	</Card.Root>
</div>

<Dialog.Root bind:open={showForfeitDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="text-amber-500">
				Forfeit Dispute
			</Dialog.Title>
			<Dialog.Description>
				By forfeiting the dispute, all funds and bonds will be returned to both parties and the offer will be marked as expired. There will be no further action required.
			</Dialog.Description>
		</Dialog.Header>
		<Input placeholder="Explanation (optional)..." bind:value={response} />
		<Dialog.Footer>
			<Button 
				variant="outline" 
				disabled={isLoading} 
				class="w-full" 
				onclick={() => {
					showForfeitDialog = false;
					response = '';
				}}
			>
				Cancel
			</Button>
			<Button 
				disabled={isLoading} 
				variant="default" 
				class="w-full" 
				onclick={()=> forfeit()}
			>
				Confirm Forfeit
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={showDisputeDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="text-destructive">
				Counter Dispute
			</Dialog.Title>
			<Dialog.Description>
				By counter-disputing, this case will be escalated to an administrator who will review all evidence. If the dispute is ruled against you, your bond may be forfeited.
			</Dialog.Description>
		</Dialog.Header>
		<Input placeholder="Explanation of your side..." bind:value={response} />
		<Dialog.Footer>
			<Button 
				variant="outline" 
				disabled={isLoading} 
				class="w-full" 
				onclick={() => {
					showDisputeDialog = false;
					response = '';
				}}
			>
				Cancel
			</Button>
			<Button 
				disabled={isLoading} 
				variant="destructive" 
				class="w-full" 
				onclick={async () => {await counterDispute()
					showDisputeDialog = false;
				}}
			>
				Submit Counter Dispute
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
