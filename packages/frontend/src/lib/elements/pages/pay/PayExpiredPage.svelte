<script lang="ts">
	import { OFFER_STATE } from '@openPleb/common/types';
	import { LoaderCircle } from 'lucide-svelte';
	import Expiry from '$lib/elements/Expiry.svelte';
	import type { Offer } from '@openPleb/common/db/schema';
	import PaymentFeedback from './components/PaymentFeedback.svelte';

    interface Props {offer: Offer}
    
    let {offer}: Props = $props();

</script>

<Expiry {offer}></Expiry>
<div class="flex flex-col items-center gap-2">
    <p>
        Waiting for receipt... {offer?.status}
    </p>
    {#if offer.status === OFFER_STATE.EXPIRED}
        <div class="flex flex-col items-center gap-2">
            <p>Offer expired.</p>
            <PaymentFeedback {offer}></PaymentFeedback>
        </div>
    {:else}
        <LoaderCircle class="animate-spin"></LoaderCircle>
    {/if}
</div>