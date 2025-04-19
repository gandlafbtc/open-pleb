<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { dataStore } from '$lib/stores/session/data.svelte';
	import { LoaderCircle, Wallet } from 'lucide-svelte';
	import { decode } from 'light-bolt11-decoder';
	import { encodeQR } from 'qr';
	import { onMount } from 'svelte';
	import { formatCurrency } from '$lib/helper';
	import Button from '$lib/components/ui/button/button.svelte';
	import { proofsStore, sendEcash } from 'cashu-wallet-engine';
	import { PUBLIC_API_VERSION, PUBLIC_BACKEND_URL, PUBLIC_MINT_URL } from '$env/static/public';
	import { ensureError } from '$lib/errors';
	import { toast } from 'svelte-sonner';
	import Expiry from '$lib/elements/Expiry.svelte';
	const id = Number.parseInt(page.params.id);
	const offer = $derived(dataStore.offers.find((o) => o.id === id));
    let isLoading = $state(false);
    
	const totalSats = $derived.by(() => {
		if (!offer) {
			return null;
		}
		const total =
			offer.satsAmount +
			offer.platformFeePercentage +
			offer.takerFeePercentage +
			offer.platformFeeFlatRate +
			offer.takerFeeFlatRate;

		return total;
	});
	const bondTotalSats = $derived.by(() => {
		if (!offer) {
			return null;
		}
		const total = offer.bondPercentage + offer.bondFlatRate;
		return total;
	});

	const createInvoice = async () => {
        try {
            isLoading = true;
			const res = await fetch(
				`${PUBLIC_BACKEND_URL}/api/${PUBLIC_API_VERSION}/offers/${id}/createinvoice`)
            if (!res.ok) {
                throw new Error(await res.text());
            }
            toast.success('Invoice created successfully');
            goto(`/pay/${id}/pay-ln`);
        } catch (error) {
            const err = ensureError(error);
			console.error(err);
			toast.error(err.message);
        }
        finally {
            isLoading = false;
        }
    };
	const payWithTokens = async () => {
		try {
            isLoading = true;
			if (!totalSats || !bondTotalSats) {
				toast.warning("Could not pay with tokens, please try again later.");
				return;
			}
			const {send} = await sendEcash(PUBLIC_MINT_URL, totalSats+bondTotalSats)
			const res = await fetch(
				`${PUBLIC_BACKEND_URL}/api/${PUBLIC_API_VERSION}/offers/${id}/paywithtokens`,
			{
				method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
				body: JSON.stringify({
					proofs: send,
				}),
			})
            if (!res.ok) {
                throw new Error(await res.text());
            }
            toast.success('Invoice created successfully');
            goto(`/pay/${id}/pay-ln`);
        } catch (error) {
            const err = ensureError(error);
			console.error(err);
			toast.error(err.message);
        }
        finally {
            isLoading = false;
        }
	};
</script>

{#if offer && totalSats && bondTotalSats}
	<div class="flex flex-col gap-2 items-center w-80 xl:w-[600px]">
        <Expiry {offer}></Expiry>
		
        <p class="text-lg font-bold">
            To list this offer, pay 
        </p>
        <p class="text-xl font-bold">{formatCurrency(totalSats, 'SAT')}</p>
		<p class="text-lg font-bold text-muted-foreground"> + {formatCurrency(bondTotalSats, 'SAT')} Bond</p>
		<Button class="w-full" onclick={payWithTokens} disabled={isLoading || (totalSats+bondTotalSats)>$proofsStore.reduce((acc, proof) => acc + proof.amount,0)}>
			Pay with tokens ({formatCurrency(totalSats + bondTotalSats, 'SAT')})</Button
		>
		<Button class="w-full"  onclick={createInvoice} disabled={isLoading} variant="outline"
			>Get Invoice ( {formatCurrency(totalSats + bondTotalSats, 'SAT')} )</Button
		>
	</div>
{:else}
	<LoaderCircle class="animate-spin"></LoaderCircle>
{/if}
