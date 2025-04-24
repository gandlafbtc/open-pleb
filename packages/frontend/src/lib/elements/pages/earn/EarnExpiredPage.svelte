<script lang="ts">
	import { checkIfRedeemed } from "$lib/actions";
	import { dataStore } from "$lib/stores/session/data.svelte";
	import type { Offer } from "@openPleb/common/db/schema";

    interface Props {offer: Offer}
    
    let {offer}: Props = $props();
    let claim = $derived(dataStore.claims.find((c) => c.offerId === offer.id));
    $effect(() => {
		if (claim?.reward) {
			checkIfRedeemed(claim?.reward);
		}
	})
</script>

<div class="flex flex-col items-center gap-2">
    <div class="flex flex-col items-center gap-2">
        <p>Offer expired.</p>
    </div>
</div>