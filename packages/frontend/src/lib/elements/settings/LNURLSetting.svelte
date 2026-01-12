<script lang="ts">
	import FormButton from "$lib/components/ui/form/form-button.svelte";
	import Input from "$lib/components/ui/input/input.svelte";
	import { ensureError } from "$lib/errors";
	import { lnurlStore } from "$lib/stores/persistent/lnurl";
	import { LoaderCircle, Pen } from "lucide-svelte";
	import { toast } from "svelte-sonner";
	import { getInvoiceForLNURLAddress  } from "@openPleb/common/lnurl";
	import { onMount } from "svelte";
    let lnurl = $derived.by(() => ($lnurlStore[0]?.address) ?? "")
    let lnurlCopy = $state("")
    let isLoading = $state(false)

	onMount(() => {
		lnurlCopy = lnurl;
	});

    const setLnurl = async () => {
        if (!lnurlCopy.toLowerCase().startsWith("LNURL") && !lnurlCopy.includes("@")) {
            toast.warning("Invalid LNURL. Please use the format 'LNURL...' or 'user@domain.com'")
            return
        }
        try {
            isLoading = true
            
            const invoice = await getInvoiceForLNURLAddress(5000, lnurlCopy)

            if (!invoice?.toLowerCase().startsWith("lnbc")) {
                throw new Error("Could not establish contact to lnurl service. Make sure you use a vaild address.");
                
            }

            lnurlStore.addOrUpdate($lnurlStore[0]?.address??"", {address:lnurlCopy}, "address")
            toast.success("LNURL set successfully")
            
        } catch (error) {
            const err = ensureError(error);
            console.error(err);
            toast.error(err.message);
        }
        finally {
            isLoading = false
        }
    }
</script>

<form onsubmit={(e)=> {
    e.preventDefault()
    setLnurl()
}}
class='flex gap-2 pt-2'
>
        <Input type="text" name="lnurl" placeholder="satoshi@bitcoin.org" bind:value={lnurlCopy}  />
        <FormButton type="submit" disabled={(lnurl === lnurlCopy)||isLoading}>
        {#if isLoading}
            <LoaderCircle class='animate-spin'></LoaderCircle>
        {:else}
            <Pen></Pen>
        {/if}
            Set LNURL
        </FormButton>
</form>
