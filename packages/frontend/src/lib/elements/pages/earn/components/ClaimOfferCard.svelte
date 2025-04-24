<script lang="ts">
	import { goto } from '$app/navigation';
	import { env
	} from '$env/dynamic/public';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { ensureError } from '$lib/errors.js';
	import { formatCurrency } from '$lib/helper.js';
	import { toast } from 'svelte-sonner';
	import { keysStore, proofsStore, sendEcash } from '@gandlaf21/cashu-wallet-engine';
	import type { Offer } from '@openPleb/common/db/schema';
	import { clock } from '$lib/stores/clock.svelte';
	import Expiry from '$lib/elements/Expiry.svelte';
	import { getEncodedToken } from "@cashu/cashu-ts";

	const {
		PUBLIC_API_VERSION,
		PUBLIC_BACKEND_URL,
		PUBLIC_CURRENCY,
		PUBLIC_MINT_URL} = env 

    interface Props {offer: Offer}
    
    let {offer}: Props = $props();

	const expiryPercentage = $derived(((offer.validForS??0)+offer.createdAt-$clock)/(offer.validForS??0)*100)

	let isLoading = $state(false);
	const claimOffer = async (offer: Offer) => {
		try {
			const proofsAmount= $proofsStore.reduce((acc, proof) => acc + proof.amount, 0);
			const bondAmount= offer.bondFlatRate+offer.bondPercentage
			if (proofsAmount< bondAmount) {
				toast.warning("Token balance too low to claim this offer.");
				return
			}

			const bond = await sendEcash(PUBLIC_MINT_URL, bondAmount)

			isLoading = true;
			const response = await fetch(
				`${PUBLIC_BACKEND_URL}/api/${PUBLIC_API_VERSION}/offers/${offer.id}/claim`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						pubkey: $keysStore[0]?.publicKey,
						bond: getEncodedToken({ mint: PUBLIC_MINT_URL, proofs: bond.send}) 
					})
				}
			);
			if (!response.ok) {
				throw new Error(await response.text());
			}
			const result = await response.json();
			if (result.claim.pubkey !== $keysStore[0].publicKey) {
				throw new Error('Offer is already claimed by another user.');
			}
			goto(`/earn/${result.claim.offerId}`);
			toast.success('Claimed offer successfully!');
			isLoading = false;
		} catch (error) {
			const err = ensureError(error);
			console.error(err);
			toast.error(err.message);
		} finally {
			isLoading = false;
		}
	};

	
</script>

<Card.Root class="w-80">
    <Card.Header>
        <Card.Title>
			<a href={`/earn/${offer.id}`}>
				Pay {formatCurrency(offer.amount, PUBLIC_CURRENCY)}
			</a>
		</Card.Title>
        <Card.Description
            >For {formatCurrency(
                (offer.satsAmount ?? 0) +
                    (offer.takerFeeFlatRate ?? 0) +
                    (offer.takerFeePercentage ?? 0),
                'SAT'
            )}</Card.Description
        >
    </Card.Header>
    <Card.Content>
        <p>
            Earn {formatCurrency(
                (offer.takerFeeFlatRate ?? 0) + (offer.takerFeePercentage ?? 0),
                'SAT'
            )}
        </p>
    </Card.Content>
    <Card.Footer class='flex flex-col gap-2 justify-between'>
        <Button class="w-full" disabled={isLoading||expiryPercentage <= 0} onclick={() => claimOffer(offer)}
            >Claim this offer ({formatCurrency(offer.bondFlatRate+offer.bondPercentage, "SAT")} Bond)</Button
        >
        <Expiry {offer}></Expiry>

    </Card.Footer>
</Card.Root>
