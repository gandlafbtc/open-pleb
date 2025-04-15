<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		PUBLIC_API_VERSION,
		PUBLIC_BACKEND_URL,
		PUBLIC_TAKER_FEE_PERCENTAGE
	} from '$env/static/public';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { ensureError } from '$lib/errors.js';
	import { formatCurrency } from '$lib/helper.js';
	import { dataStore } from '$lib/stores/session/data';
	import { toast } from 'svelte-sonner';
	import type { Offer } from '../../../../common/src/db/schema';
	import { OFFER_STATE } from '@openPleb/common/types';
	import { keysStore } from 'cashu-wallet-engine';

	let isLoading = $state(false);
	const id = Number.parseInt(page.params.id);
	const offers = $derived($dataStore?.offers.filter((o) => o.status === OFFER_STATE.INVOICE_PAID));
	const claimOffer = async (offer: Offer) => {
		try {
			isLoading = true;
			const response = await fetch(
				`${PUBLIC_BACKEND_URL}/api/${PUBLIC_API_VERSION}/offers/${offer.id}/claim`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						pubkey: $keysStore[0]?.publicKey
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
			goto(`/earn/claim/${result.claim.offerId}`);
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

<p>
	{offers?.length} offers available.
</p>
{#if offers?.length}
	{#each offers as offer}
		<Card.Root class="w-80">
			<Card.Header>
				<Card.Title>Pay {formatCurrency(offer.amount, 'KRW')}</Card.Title>
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
			<Card.Footer>
				<Button class="w-full" disabled={isLoading} onclick={() => claimOffer(offer)}
					>Claim this offer</Button
				>
			</Card.Footer>
		</Card.Root>
	{/each}
{/if}
