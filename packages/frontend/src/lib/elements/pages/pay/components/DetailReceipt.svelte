<script lang="ts">
import * as Card from '$lib/components/ui/card/index.js';
import { formatCurrency } from '$lib/helper';
import type { Offer, Receipt } from "@openPleb/common/db/schema";
import Expiry from "$lib/elements/Expiry.svelte";
import { BadgeDollarSign, Coins, FileImage, Fullscreen, Info, Rotate3D, Stamp } from "lucide-svelte";
import { OFFER_STATE } from '@openPleb/common/types';

interface Props {
	offer: Offer;
	receipt?: Receipt | null;
}

let { offer, receipt = null }: Props = $props();

let showFullScreen = $state(false);

// Format date from unix timestamp
const formatDate = (timestamp: number | null | undefined) => {
	if (!timestamp) return 'N/A';
	return new Date(timestamp * 1000).toLocaleString();
};
</script>



<Card.Root class="w-full">
    <Card.Header>
        <Card.Title class="flex items-center justify-between">
            <span>Receipt</span>
            <span class="text-sm font-semibold px-2 py-1 {offer.status === OFFER_STATE.ERROR || offer.status === OFFER_STATE.EXPIRED || offer.status === OFFER_STATE.MARKED_WITH_ISSUE ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800' } rounded-full">
                {offer.status}
            </span>
        </Card.Title>
        <Card.Description>
            Paid at {formatDate(offer.paidAt)}
        </Card.Description>
    </Card.Header>
    <Card.Content class="space-y-4">
        {#if receipt}
        
        <div class="flex items-center gap-2">
            <FileImage class="h-5 w-5" />
            <div>
                <p class="font-semibold">Receipt Image</p>
            </div>
        </div>
        
        <div class="w-full overflow-hidden rounded-lg border relative">
            <div class="absolute right-5 top-5">
                <button
                    onclick={() => {
                        showFullScreen = true;
                    }}
                    class="opacity-80 hover:opacity-100 transition-colors p-2 rounded-md bg-background"
                >
                    <Fullscreen></Fullscreen>
                </button>
            </div>
            <img
            src={receipt.receiptImg}
            alt="Receipt"
            class="h-auto max-h-80 w-full object-contain"
            />
        </div>
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
        {:else if offer.receiptSkipped}
        <div class="flex items-start gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
            <Info class="mt-0.5 h-4 w-4" />
            <p>The payer skipped the receipt upload for this offer.</p>
        </div>
        {/if}

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
                <p class="font-semibold"></p>
                <p><span class="font-bold">Reward</span> {formatCurrency(offer.platformFeeFlatRate + offer.platformFeePercentage + offer.takerFeeFlatRate + offer.takerFeePercentage, "SAT")}</p>
                <p><span class="font-bold">Bond</span> {formatCurrency(offer.bondFlatRate + offer.bondPercentage, "SAT")}</p>
            </div>
        </div>
        {#if offer.status !== OFFER_STATE.COMPLETED && offer.status !== OFFER_STATE.EXPIRED && offer.status !== OFFER_STATE.ERROR && offer.status !== OFFER_STATE.MARKED_WITH_ISSUE}
        
        <div>
            <p class="font-semibold mb-1">Expiry</p>
            <Expiry offer={offer} />
        </div>
        {/if}
    </Card.Content>
</Card.Root>
