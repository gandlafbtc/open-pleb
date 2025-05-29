<script lang="ts">
	import type { Offer } from '@openPleb/common/db/schema';
	import PayCompletedPage from './PayCompletedPage.svelte';
	import ResolutionDetails from '../shared/ResolutionDetails.svelte';
	import { dataStore } from '$lib/stores/session/data.svelte';

    interface Props {offer: Offer}
    
    let {offer}: Props = $props();
	let claim = $derived(dataStore.claims.find((c) => c.offerId === offer.id));

</script> 

<div>
    {#if claim}
    <ResolutionDetails {claim} {offer}> </ResolutionDetails>
    {/if}
  <PayCompletedPage {offer}></PayCompletedPage>
</div>
