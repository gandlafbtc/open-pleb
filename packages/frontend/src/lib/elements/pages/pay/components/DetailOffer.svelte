<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { formatCurrency } from '$lib/helper';
	import type { Offer } from "@openPleb/common/db/schema";
	import Expiry from "$lib/elements/Expiry.svelte";
	import { BadgeDollarSign, CalendarDays, Coins, CurrencyIcon, Info, Landmark, Rotate3D, Stamp } from "lucide-svelte";
	import { dataStore } from '$lib/stores/session/data.svelte';

    interface Props {offer: Offer}
    
    const {offer} = $props() as Props;

    const provider = dataStore.providers.find(p => p.id === offer.fiatProviderId);
    
    // Format date from unix timestamp
    const formatDate = (timestamp: number | undefined) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp * 1000).toLocaleString();
    };
</script>



<Card.Root class="w-full">
    <Card.Header>
        <Card.Title class="flex items-center justify-between">
            <span>Offer</span>
            <span class="text-sm font-semibold px-2 py-1 bg-green-100 text-green-800 rounded-full">
                {offer.status}
            </span>
        </Card.Title>
        <Card.Description>
            Listed at {formatDate(offer.createdAt)}
        </Card.Description>
    </Card.Header>
    <Card.Content class="space-y-4">
        <div class="flex items-center gap-2">
            <Landmark class="h-5 w-5" />
            <div>
                <p class="font-semibold">Provider</p>
                <div class="flex items-center gap-2">
                {#if provider }
                <img src={provider.icon} alt="" class="w-6 h-6 rounded-md">
                <p>{provider.label}</p>
                  
                {:else}
                  <p>Unknown provider</p>
                {/if}
                </div>
            </div>
        </div>
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
                <p>Reward: {formatCurrency(offer.platformFeeFlatRate + offer.platformFeePercentage + offer.takerFeeFlatRate + offer.takerFeePercentage, "SAT")}</p>
                <p>Bond: {formatCurrency(offer.bondFlatRate + offer.bondPercentage, "SAT")}</p>
            </div>
        </div>
        <div>
            <p class="font-semibold mb-1">Expiry</p>
            <Expiry offer={offer} />
        </div>
    </Card.Content>
</Card.Root>