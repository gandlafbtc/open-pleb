<script lang="ts">
	import Progress from "$lib/components/ui/progress/progress.svelte";
	import { clock } from "$lib/stores/clock.svelte";
	import type { Offer } from "@openPleb/common/db/schema";


    interface Props {offer: Offer}
    
    let {offer}: Props = $props();

    const expiryPercentage = $derived((((offer.validForS??0)+offer.createdAt-$clock)/(offer.validForS??0))*100)

</script>


<Progress value={expiryPercentage}>

</Progress>