<script lang="ts">
	import type { Offer } from "@openPleb/common/db/schema";
	import ClaimOfferCard from "./components/ClaimOfferCard.svelte";

    interface Props {offer: Offer}
    
    let {offer}: Props = $props();
</script>

<ClaimOfferCard {offer}></ClaimOfferCard>