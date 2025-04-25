<script>
	import { goto } from "$app/navigation";
	import { env } from "$env/dynamic/public";
	import Badge from "$lib/components/ui/badge/badge.svelte";
	import FormButton from "$lib/components/ui/form/form-button.svelte";
import Input from "$lib/components/ui/input/input.svelte";
	import SimpleScanner from "$lib/elements/SimpleScanner.svelte";
	import { ensureError } from "$lib/errors";
	import { formatCurrency } from "$lib/helper";
	import { getInvoiceForLNURLAddress } from "@openPleb/common/lnurl";
	import { createMeltQuote, meltQuotesStore, proofsStore } from "@gandlaf21/cashu-wallet-engine";
	import { decode } from "light-bolt11-decoder";
	import { Check, LoaderCircle, QrCode, Scan } from "lucide-svelte";
	import { toast } from "svelte-sonner";
    
    const {PUBLIC_MINT_URL} = env;

    let invoiceOrAddress = $state(""); 
    let isLoading = $state(false);
    let amount = $state(0);
    let showScanner = $state(false);
    

    let inputType = $derived.by(() => {
        let input = invoiceOrAddress.toLocaleLowerCase()
        if (input.startsWith("lightning:")) {
            input = input.replace("lightning:", "")
        }
        // if (input.startsWith("lnurl")) {
        //     return "lnurl";
        // }
        if (input.includes("@")) {
            return "address";
        }
        if (input.startsWith("lnbc")) {
            return "invoice";
        }
        return "unknown";
    });

    const handleMelt = async () => {
        try {
            if (inputType ===  "unknown") {
                throw new Error("Invalid input type");
            }
            isLoading = true;
            let invoice = ""
            if (inputType === "address") {
              invoice = await getInvoiceForLNURLAddress(amount, invoiceOrAddress)   
            }
            else if (inputType === "invoice") {
                invoice = invoiceOrAddress;
            }
            
            const quote = await createMeltQuote(PUBLIC_MINT_URL,invoice)
            goto(`/wallet/melt/${quote.quote}`)
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
[...$meltQuotesStore].sort((a, b) => b.lastChangedAt - a.lastChangedAt).slice(0, limit)
);
</script>
{#if showScanner}
    <SimpleScanner bind:isScanning={showScanner} bind:scannedResult={invoiceOrAddress}> </SimpleScanner>
{/if}
<form class="flex flex-col gap-2 w-80 xl:w-[600px]" onsubmit={event => {event.preventDefault(); handleMelt()}}>
    <p class="text-center mb-5">
        {formatCurrency($proofsStore.reduce((acc, proof) => acc + proof.amount, 0), "SAT")}
    </p>
    <div class="relative">
        <div onclick={(e)=> {
            e.preventDefault()
            showScanner=!showScanner;
        }} class="absolute right-2 top-2">
            <Scan></Scan>
    </div>
        <Input type="text" placeholder="lnurl/address/invoice" bind:value={invoiceOrAddress}/>
    </div>
    <div class="flex flex-col gap-2 w-full h-40">

        {#if inputType === "invoice"}
        {@const decoded = decode(invoiceOrAddress)}

        {#if decoded?.sections[2]?.value}
           <p class="">
                Amount: {formatCurrency( decoded.sections[2].value/1000, "SAT")}
            </p>
        {:else}
            <p class="text-red-500">
                Could not parse amount from invoice
            </p>
        {/if}
        {:else if (inputType === "address" || inputType === "lnurl")}
            <Input type="number" placeholder="amount" bind:value={amount}/>
        {/if}

    </div>
    <FormButton type="submit" disabled={inputType === "unknown" || isLoading || ((inputType === "address" || inputType === "lnurl") && !amount)}>
        {#if isLoading}
            <LoaderCircle class="animate-spin">
                
            </LoaderCircle>
          
        {:else}
          <Check></Check>
        {/if}
        Prepare
    </FormButton>
</form>

<div class="mt-20 flex flex-col gap-2 w-80 xl:w-[600px]">
    <p class="font-bold">
        Past cash out Requests
    </p>
    {#each latest as mq}
    <a href="/wallet/melt/{mq.quote}" class="border border-muted p-4 flex rounded-xl justify-between ">
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
        if (limit + 5 < $meltQuotesStore.length) {
            limit += 5;
        } else {
            limit = $meltQuotesStore.length;
        }
    }}
>
    <span class="text-xs">load more</span>
</button>
</div>