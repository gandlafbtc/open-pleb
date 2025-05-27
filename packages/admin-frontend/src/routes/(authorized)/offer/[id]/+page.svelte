<script lang="ts">
	import { page } from '$app/state';
	import OfferDetails from '$lib/elements/offerDetails/OfferDetails.svelte';
	import { ensureError } from '$lib/errors';
	import { dataStore } from '$lib/stores/data.svelte';
	import { LoaderCircle } from 'lucide-svelte';


    import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
    let isLoading = $state(false)
    
    onMount(async () => {
        try {
            isLoading = true
            await dataStore.fetchForId(page.params.id)
        } catch (error) {
            const err = ensureError(error);
            toast.error(err.message)
            console.log(err)
        }
        finally {
            isLoading = false
        }
    });

</script>

{#if isLoading}
  <LoaderCircle class='animate-spin'></LoaderCircle>
{:else}
  <OfferDetails id={Number.parseInt(page.params.id)}></OfferDetails>
{/if}