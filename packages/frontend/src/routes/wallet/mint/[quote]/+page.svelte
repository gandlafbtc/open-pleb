<script lang="ts">
	import { page } from "$app/state";
	import Button from "$lib/components/ui/button/button.svelte";
	import CopiableToken from "$lib/elements/CopiableToken.svelte";
	import { formatCurrency } from "$lib/helper";
	import { MintQuoteState } from "@cashu/cashu-ts";
	import { mintQuotesStore } from "cashu-wallet-engine";
	import { CheckCircle, LoaderCircle } from "lucide-svelte";
	import encodeQR from "qr";

    const {quote} = page.params

    let currentQuote = $derived($mintQuotesStore.find(q => q.quote === quote))

</script>

<div class="flex flex-col gap-2 w-80 xl:w-[600px] items-center">
    {#if currentQuote?.state === MintQuoteState.UNPAID}
      
    <p class="font-bold">
        Pay this invoice to mint {formatCurrency(currentQuote?.amount?? 0, "SAT")} bond tokens.
    </p>
    <a href="lightning:{currentQuote?.request?? ""}" class="border border-muted bg-white p-2 flex rounded-xl justify-between w-80">
        {@html encodeQR(currentQuote?.request?? "", "svg")}
    </a>
    <div class="w-80">
        <CopiableToken token={currentQuote?.request ?? ""} />
    </div>
    {:else if currentQuote?.state === MintQuoteState.PAID}
    {@const shownAt = Date.now()}

        <p class="font-bold">
            Invoce was paid! Tokens should arive shortly.
        </p>
        <LoaderCircle class="animate-spin">
        </LoaderCircle>
    {:else if currentQuote?.state === MintQuoteState.ISSUED}
      
    <p class="font-bold">
        Tokens have been issued!
    </p>
    <CheckCircle></CheckCircle>

    <Button href="/" class="mt-4" >
        OK!
    </Button>
    {/if}
</div>
