<script lang="ts">
	import type { Offer } from "@openPleb/common/db/schema";
	import EarnCompletedPage from "./EarnCompletedPage.svelte";
	import { dataStore } from "$lib/stores/session/data.svelte";
	import ResolutionDetails from "../shared/ResolutionDetails.svelte";
    interface Props {offer: Offer}
    
    let {offer}: Props = $props();
	let claim = $derived(dataStore.claims.find((c) => c.offerId === offer.id));

</script>
{#if claim}
<ResolutionDetails {claim} {offer}> </ResolutionDetails>
{/if}
<EarnCompletedPage {offer}></EarnCompletedPage>