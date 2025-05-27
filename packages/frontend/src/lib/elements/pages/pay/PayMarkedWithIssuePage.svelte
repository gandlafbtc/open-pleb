<script lang="ts">
	import type { Offer } from "@openPleb/common/db/schema";
	import * as Card from '$lib/components/ui/card/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import Expiry from "$lib/elements/Expiry.svelte";

    interface Props {offer: Offer}
    
    let {offer}: Props = $props();
</script>

<div class="flex justify-center items-center p-4">
	<Card.Root class="w-full max-w-md">
		<Card.Header>
			<Card.Title class="text-amber-500">
				Dispute Opened
			</Card.Title>
			<Card.Description>
				A dispute has been opened for this payment
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<p class="mb-4">
				The payment has been marked with an issue and is under review. This dispute will be investigated by the operators.
			</p>
			<p class="mb-4">
				Current status: <span class="font-medium">{offer?.status}</span>
			</p>
			<p class="text-sm text-muted-foreground">
				Note: Your bond is held until this dispute is resolved. The resolution decision will be based on the evidence provided by both parties.
			</p>
		</Card.Content>
		<Card.Footer class="flex flex-col gap-2 justify-end">
			<Button variant="outline" class="w-full">
				View Details
			</Button>
			<Expiry {offer}></Expiry>
		</Card.Footer>
	</Card.Root>
</div>
