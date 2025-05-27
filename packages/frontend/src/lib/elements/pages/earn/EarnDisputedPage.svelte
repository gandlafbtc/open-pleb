<script lang="ts">
	import type { Offer } from "@openPleb/common/db/schema";
	import * as Card from '$lib/components/ui/card/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import Expiry from "$lib/elements/Expiry.svelte";
	import { formatCurrency } from '$lib/helper';
	import { BadgeDollarSign, AlertTriangle, Coins, Rotate3D, Stamp, Info } from "lucide-svelte";

    interface Props {offer: Offer}
    
    const {offer}: Props = $props();
    
    // Format date from unix timestamp
    const formatDate = (timestamp: number | undefined) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp * 1000).toLocaleString();
    };
</script>

<div class="flex flex-col justify-center items-center p-4 gap-4 w-full max-w-4xl mx-auto">
	<!-- Dispute Notice Card -->
	<Card.Root class="w-full max-w-3xl">
		<Card.Header>
			<Card.Title class="flex items-center gap-2 text-red-500">
				<AlertTriangle class="h-5 w-5" />
				<span>Dispute Under Review</span>
			</Card.Title>
			<Card.Description>
				This payment has been escalated to a dispute and is currently under review by administrators
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<p class="mb-4">
				Both parties have engaged in a dispute process regarding this payment. The administrators will review all evidence provided and make a determination.
			</p>
			<p class="mb-4">
				Current status: <span class="font-medium">{offer?.status}</span>
			</p>
			<p class="text-sm text-muted-foreground">
				Note: All bonds are held until this dispute is resolved. The resolution decision will be based on the evidence provided by both parties and the review of transaction details.
			</p>
		</Card.Content>
	</Card.Root>

	<!-- Offer Details Card -->
	<Card.Root class="w-full max-w-3xl">
		<Card.Header>
			<Card.Title>Offer Details</Card.Title>
			<Card.Description>
				Listed at {formatDate(offer.createdAt)}
			</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="flex items-center gap-2">
				<BadgeDollarSign class="h-5 w-5" />
				<div>
					<p class="font-semibold">Amount</p>
					<p>{formatCurrency(offer.amount, offer.currency ?? "?")}</p>
				</div>
			</div>
			
			<div class="flex items-center gap-2">
				<Coins class="h-5 w-5" />
				<div>
					<p class="font-semibold">Sats Amount</p>
					<p>{formatCurrency(offer.satsAmount, 'SAT')}</p>
				</div>
			</div>

			<div class="flex items-center gap-2">
				<Rotate3D class="h-5 w-5" />
				<div>
					<p class="font-semibold">Exchange rate</p>
					<p>1 BTC = {formatCurrency(offer.conversionRate, offer.currency?? "?")}</p>
				</div>
			</div>

			<div class="flex items-center gap-2">
				<Stamp class="h-5 w-5" />
				<div>
					<p class="font-semibold">Fees & Bonds</p>
					<p>Reward: {formatCurrency(offer.platformFeeFlatRate + offer.platformFeePercentage + offer.takerFeeFlatRate + offer.takerFeePercentage, "SAT")}</p>
					<p>Bond: {formatCurrency(offer.bondFlatRate + offer.bondPercentage, "SAT")}</p>
				</div>
			</div>

			<div>
				<p class="font-semibold mb-1">Expiry</p>
				<Expiry offer={offer} />
			</div>
		</Card.Content>
		<Card.Footer class="flex justify-end">
		</Card.Footer>
	</Card.Root>
</div>
