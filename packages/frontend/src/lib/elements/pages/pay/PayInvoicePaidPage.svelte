<script lang="ts">
	import { env } from '$env/dynamic/public';
	import type { Offer } from "@openPleb/common/db/schema";
	import DetailOffer from "./components/DetailOffer.svelte";

    interface Props {offer: Offer}
    
    let {offer}: Props = $props();
    
    // Format date from unix timestamp
    const formatDate = (timestamp: number | undefined) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp * 1000).toLocaleString();
    };
</script>

{#if offer}
<div class="flex flex-col gap-2 items-center">
    <p class="text-lg font-bold">
        Offer listed!
    </p>
    <p>
        Waiting for taker to claim the offer...
    </p>
    <DetailOffer {offer}></DetailOffer>
</div>
{/if}
