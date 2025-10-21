<script lang="ts">
	import { dataStore } from "$lib/stores/data.svelte";
	import Button from "$lib/components/ui/button/button.svelte";
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from "$lib/components/ui/label/index.js";
	import { GavelIcon, Send } from "lucide-svelte";
	import { OFFER_STATE, RESOLUTION_PATHS } from "@openPleb/common/types";
	import { toast } from "svelte-sonner";
	import { env } from "$env/dynamic/public";
	import { userLoggedIn } from "$lib/stores/user";
	import { get } from "svelte/store";
	import { ensureError } from "$lib/errors";
	import { PUBLIC_API_VERSION } from "$env/static/public";

	const { PUBLIC_BACKEND_URL } = env;

	const offerId = $derived(dataStore.offers.find(o => o.status === OFFER_STATE.DISPUTED)?.id);
	let resolution = $state(RESOLUTION_PATHS.RETURN); // Default to maker winning
	let resolutionReason = $state("");
	let isSubmitting = $state(false);

	const resolutionOptions = [
		{ value: RESOLUTION_PATHS.MAKER_WINS, label: "Maker wins (offer creator)" },
		{ value: RESOLUTION_PATHS.TAKER_WINS, label: "Taker wins (claim creator)" },
		{ value: RESOLUTION_PATHS.SPLIT, label: "Split (50/50)" },
		{ value: RESOLUTION_PATHS.RETURN, label: "Return all funds" }
	];

	async function handleResolveDispute() {
		if (!resolutionReason) {
			toast.error("Please provide a reason for your decision");
			return;
		}

		if (!offerId) {
			toast.error("No disputed offer found");
			return;
		}

		isSubmitting = true;

		try {
			// This is a placeholder for the actual API call
			// In a real implementation, we would make an API call to a backend endpoint
			// that handles dispute resolution
			const response = await fetch(`${PUBLIC_BACKEND_URL}/api/${PUBLIC_API_VERSION}/admin/resolvedispute`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${get(userLoggedIn)?.access_token}`
				},
				body: JSON.stringify({
					offerId,
					resolution,
					resolutionReason
				})
			});

			if (!response.ok) {
				throw new Error(`Server responded with ${response.status}`);
			}

			// Placeholder for success
			// In a real implementation, we would update the offer based on the response
			toast.success("Dispute resolved successfully");
			
		} catch (error) {
			console.error("Error resolving dispute:", error);
			const err  =  ensureError(error);
			toast.error("Failed to resolve dispute.", {description: err.message});
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="p-4 border rounded-md mb-4">
	<Card.Header>
		<Card.Title class="flex items-center gap-2">
			<GavelIcon class="h-5 w-5" />
			<span>Resolve Dispute</span>
		</Card.Title>
		<Card.Description>
			As an administrator, you can resolve this dispute by choosing which party should receive the bonds.
		</Card.Description>
	</Card.Header>
	
	<Card.Content class="space-y-4">
		<div class="mb-4">
			<Label class="block text-sm font-medium mb-2">Resolution Decision</Label>
			<div class="flex flex-col space-y-2">
				{#each resolutionOptions as option}
					<div class="flex items-center space-x-2">
						<input 
							type="radio" 
							name="resolution" 
							value={option.value} 
							id={option.value}
							checked={resolution === option.value}
							onchange={() => resolution = option.value}
						/>
						<Label for={option.value} class="text-sm font-medium leading-none cursor-pointer">
							{option.label}
						</Label>
					</div>
				{/each}
			</div>
		</div>
		
		<div class="mb-4">
			<Label for="resolution-reason" class="block text-sm font-medium mb-2">Resolution Reason</Label>
			<textarea
				id="resolution-reason"
				placeholder="Provide a detailed explanation for your decision..."
				class="w-full min-h-[120px] p-2 border rounded-md"
				bind:value={resolutionReason}
			></textarea>
			<p class="text-xs text-muted-foreground mt-1">
				This explanation will be visible to both parties involved in the dispute.
			</p>
		</div>
		
		<div class="flex justify-end space-x-2">
			<Button onclick={handleResolveDispute} disabled={isSubmitting}>
				{#if isSubmitting}
					<span class="mr-2">Processing...</span>
				{:else}
					<Send class="h-4 w-4 mr-2" />
					<span>Resolve Dispute</span>
				{/if}
			</Button>
		</div>
	</Card.Content>
	
	<Card.Footer>
		<p class="text-xs text-muted-foreground">
			Note: This action is final and cannot be undone. Please review your decision carefully.
		</p>
	</Card.Footer>
</div>
