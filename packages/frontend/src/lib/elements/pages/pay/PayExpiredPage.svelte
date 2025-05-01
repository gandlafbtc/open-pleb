<script lang="ts">
	import { checkIfRedeemed } from '$lib/actions';
	import type { Offer } from '@openPleb/common/db/schema';
	import DetailReceipt from './components/DetailReceipt.svelte';

    interface Props {offer: Offer}
    
    let {offer}: Props = $props();

	$effect(() => {
		if (offer?.refund) {
			checkIfRedeemed(offer?.refund);
		}
	})
</script>

<DetailReceipt {offer} receipt={null}></DetailReceipt>