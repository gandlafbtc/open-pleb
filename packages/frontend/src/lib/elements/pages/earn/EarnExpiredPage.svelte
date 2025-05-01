<script lang="ts">
	import { checkIfRedeemed } from "$lib/actions";
	import { dataStore } from "$lib/stores/session/data.svelte";
	import type { Offer } from "@openPleb/common/db/schema";
	import DetailReceipt from "../pay/components/DetailReceipt.svelte";

    interface Props {offer: Offer}
    
    let {offer}: Props = $props();
    let claim = $derived(dataStore.claims.find((c) => c.offerId === offer.id));
    $effect(() => {
		if (claim?.reward) {
			checkIfRedeemed(claim?.reward);
		}
	})
</script>

<DetailReceipt {offer} receipt={null}></DetailReceipt>