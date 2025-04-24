<script lang="ts">
	import { checkIfRedeemed } from '$lib/actions';
	import type { Offer } from '@openPleb/common/db/schema';

    interface Props {offer: Offer}
    
    let {offer}: Props = $props();

	$effect(() => {
		if (offer?.refund) {
			checkIfRedeemed(offer?.refund);
		}
	})
</script>

<div class="flex flex-col items-center gap-2">
        <div class="flex flex-col items-center gap-2">
            <p>Offer expired.</p>
        </div>
</div>