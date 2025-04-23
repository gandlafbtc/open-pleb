<script lang="ts">
	import { page } from "$app/state";
	import Button from "$lib/components/ui/button/button.svelte";
	import CopiableToken from "$lib/elements/CopiableToken.svelte";
	import { ensureError } from "$lib/errors";
	import { formatCurrency } from "$lib/helper";
	import { checkMeltQuote, meltProofs, meltQuotesStore } from "@gandlaf21/cashu-wallet-engine";
	import { toast } from "svelte-sonner";
    import { MeltQuoteState } from "@cashu/cashu-ts";
	import { EXPIRED } from "../../../../../../../../cashu/cashu-wallet-engine/dist/db/models/types";
	import { CheckCircle, LoaderCircle, Zap } from "lucide-svelte";

    const {quote} = page.params

    let isLoading = $state(false)

    let currentQuote = $derived($meltQuotesStore.find(q => q.quote === quote))

    const handleMelt = async () => {
        try {
            if (!currentQuote) {
                throw new Error("Invalid quote");
            }
            isLoading = true;
            await meltProofs(currentQuote)
        }
        catch (error) {
            const err = ensureError(error);
			console.error(err);
			toast.error(err.message);  
        }
        finally {
            isLoading = false;
        }
    }
    

    const checkQuote = async () => {
        try {
            if (!currentQuote) {
                throw new Error("Invalid quote");
            }
            isLoading = true;
            await checkMeltQuote(currentQuote)
        }
        catch (error) {
            const err = ensureError(error);
			console.error(err);
			toast.error(err.message);  
        }
        finally {
            isLoading = false;
        }
    }
    
</script>

<div class="flex flex-col gap-2 w-80 xl:w-[600px] items-center">
    {#if currentQuote?.state === MeltQuoteState.UNPAID}
    <p>
        
        Cashing out {formatCurrency(currentQuote?.amount??0, "SAT")}
    </p>
    <p>
        Fee reserved: {formatCurrency(currentQuote?.fee_reserve??0, "SAT")}
    </p>
    <Button class="mt-4" disabled={isLoading} onclick={handleMelt}>
        {#if isLoading}
        <LoaderCircle class="animate-spin"></LoaderCircle>
        {:else}
        <Zap></Zap>
        {/if}
        Confirm
    </Button>
      
    {:else if currentQuote?.state ===  EXPIRED.EXPIRED}
        <p>Quote has Expired</p>
    {:else if currentQuote?.state === MeltQuoteState.PAID}
        <p>{formatCurrency(currentQuote?.amount??0, "SAT")} payment completed!</p>
        <CheckCircle></CheckCircle>
        <Button class="mt-4" disabled={isLoading} href="/">
        OK!</Button>
    {:else if  currentQuote?.state === MeltQuoteState.PENDING}
        <p>Payment is pending...</p>
        <Button class="mt-4" disabled={isLoading} href="/" onclick={checkQuote}>
       Check for updates</Button>   
    {/if}
</div>
