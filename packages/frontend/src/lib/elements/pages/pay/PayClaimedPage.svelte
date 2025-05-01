<script lang="ts">
	import type { Offer } from "@openPleb/common/db/schema";
	import DetailOffer from "./components/DetailOffer.svelte";

    interface Props {offer: Offer}
    
    let {offer}: Props = $props() as Props;
</script>


<div class="flex flex-col gap-2 items-center w-full">
    <p class="text-lg font-bold">
        Offer claimed!
    </p>
    <p>
        Waiting for taker to pay the merchant...
    </p>
    <DetailOffer {offer}></DetailOffer>
</div>