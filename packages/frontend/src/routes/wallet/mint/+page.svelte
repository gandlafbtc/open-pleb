<script>
	import { goto } from "$app/navigation";
	import Badge from "$lib/components/ui/badge/badge.svelte";
	import FormButton from "$lib/components/ui/form/form-button.svelte";
    import Input from "$lib/components/ui/input/input.svelte";
	import { ensureError } from "$lib/errors";
	import { formatCurrency } from "$lib/helper";
	import { createMintQuote, mintQuotesStore, mintsStore } from "@gandlaf21/cashu-wallet-engine";
	import { Banknote, LoaderCircle } from "lucide-svelte";
	import { toast } from "svelte-sonner";
    let amount = $state(0)
    let isLoading = $state(false)

    const handleMint = async () => {
        try {
            isLoading = true;
            const {quote} = await createMintQuote($mintsStore[0].url, amount)
            goto(`/wallet/mint/${quote}`)
        } catch (error) {
            const err = ensureError(error);
			console.error(err);
			toast.error(err.message);   
        }
        finally {
            isLoading = false;
        }
    }
    let limit = $state(2);

    let latest = $derived(
    [...$mintQuotesStore].sort((a, b) => b.lastChangedAt - a.lastChangedAt).slice(0, limit)
);
</script>
<div class="flex flex-col gap-2 items-center w-80 xl:w-[600px]">

    <form class="flex gap-2 w-full" onsubmit={(e) => {
        e.preventDefault();
        handleMint()    
    }} >
        
        <Input type="number" placeholder='0' bind:value={amount} />
        <FormButton type='submit' disabled={!amount || isLoading} >
            {#if isLoading}
              <LoaderCircle class='animate-spin'></LoaderCircle>
            {:else}
              <Banknote></Banknote>
            {/if}
            Mint
        </FormButton>
    </form>
    <p class="mt-10 text-xl font-bold">
        Mint

        {formatCurrency(amount, "SAT")}
        Bond tokens
    </p>
</div>

<div class="mt-20 flex flex-col gap-2 w-80 xl:w-[600px]">
    <p class="font-bold">
        Past Minting Requests
    </p>
    {#each latest as mq}
    <a href="/wallet/mint/{mq.quote}" class="border border-muted p-4 flex rounded-xl justify-between ">
        <p class="font-bold">
            {formatCurrency(mq.amount, "SAT")}
        </p>
        <Badge>
            {mq.state}
        </Badge>
    </a>
    {/each}
    <button
    class="flex w-full rounded-xl border p-5"
    onclick={() => {
        if (limit + 5 < $mintQuotesStore.length) {
            limit += 5;
        } else {
            limit = $mintQuotesStore.length;
        }
    }}
>
    <span class="text-xs">load more</span>
</button>
</div>