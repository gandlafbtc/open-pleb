<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		PUBLIC_API_VERSION,
		PUBLIC_BACKEND_URL,
		PUBLIC_CURRENCY,
	} from '$env/static/public';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { ensureError } from '$lib/errors.js';
	import { formatCurrency } from '$lib/helper.js';
	import { dataStore } from '$lib/stores/session/data.svelte';
	import { toast } from 'svelte-sonner';
	import { OFFER_STATE } from '@openPleb/common/types';
	import { keysStore } from 'cashu-wallet-engine';
	import ChevronLeft from "@lucide/svelte/icons/chevron-left";
		import ChevronRight from "@lucide/svelte/icons/chevron-right";
		import { MediaQuery } from "svelte/reactivity";
		import * as Pagination from "$lib/components/ui/pagination/index.js";
	import type { Offer } from '@openPleb/common/db/schema';
	import { clock } from '$lib/stores/clock.svelte';
	import Expiry from '$lib/elements/Expiry.svelte';

	let isLoading = $state(false);
	const id = Number.parseInt(page.params.id);
	const offers = $derived(dataStore.offers.filter((o) => o.status === OFFER_STATE.INVOICE_PAID));
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
						pubkey: $keysStore[0]?.publicKey.slice(2)
					})
				}
			);
			if (!response.ok) {
				throw new Error(await response.text());
			}
			const result = await response.json();
			if (result.claim.pubkey !== $keysStore[0].publicKey.slice(2)) {
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

		
		const isDesktop = new MediaQuery("(min-width: 768px)");
		
		const count = $derived(offers.length)
		
		const perPage = $derived(isDesktop.current ? 10 : 5);
		const siblingCount = $derived(isDesktop.current ? 1 : 0);
		let currentPage = $state(1)
		const pageItems = $derived.by(() => {
			const start = (currentPage - 1) * perPage;
			const end = start + perPage;
			return offers.slice(start, end);
		})
</script>

<p>
	{offers?.length} offers available.
</p>
{#if offers?.length}
	{#each pageItems as offer}
		{@const expiryPercentage = (((offer.validForS??0)+offer.createdAt-$clock)/(offer.validForS??0))*100}
		<Card.Root class="w-80">
			<Card.Header>
				<Card.Title>Pay {formatCurrency(offer.amount, PUBLIC_CURRENCY)}</Card.Title>
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
			<Card.Footer class='gap-2 justify-between'>
				<Button class="w-full" disabled={isLoading||expiryPercentage <= 0} onclick={() => claimOffer(offer)}
					>Claim this offer</Button
				>
				<Expiry {offer}></Expiry>

			</Card.Footer>
		</Card.Root>
	{/each}
	<Pagination.Root {count} {perPage} {siblingCount} bind:page={currentPage}>
		{#snippet children({ pages, currentPage })}
		<Pagination.Content>
			<Pagination.Item>
				<Pagination.PrevButton>
					<ChevronLeft class="size-4" />
					<span class="hidden sm:block">Previous</span>
				</Pagination.PrevButton>
			</Pagination.Item>
			{#each pages as page (page.key)}
			{#if page.type === "ellipsis"}
			<Pagination.Item>
				<Pagination.Ellipsis />
			</Pagination.Item>
			{:else}
			<Pagination.Item>
				<Pagination.Link {page} isActive={currentPage === page.value}>
					{page.value}
				</Pagination.Link>
			</Pagination.Item>
			{/if}
			{/each}
			<Pagination.Item>
				<Pagination.NextButton>
					<span class="hidden sm:block">Next</span>
					<ChevronRight class="size-4" />
				</Pagination.NextButton>
			</Pagination.Item>
		</Pagination.Content>
		{/snippet}
	</Pagination.Root>
	{/if}