<script lang="ts">
	import { page } from '$app/state';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { formatCurrency } from '$lib/helper.js';
	import { dataStore } from '$lib/stores/session/data.svelte';
	import { keysStore } from '@gandlaf21/cashu-wallet-engine';
	import ChevronLeft from "@lucide/svelte/icons/chevron-left";
		import ChevronRight from "@lucide/svelte/icons/chevron-right";
		import { MediaQuery } from "svelte/reactivity";
		import * as Pagination from "$lib/components/ui/pagination/index.js";
	import Badge from '$lib/components/ui/badge/badge.svelte';

	const {OPENPLEB_CURRENCY} = dataStore.env;

	const id = Number.parseInt(page.params.id);
	const offerIds = $derived(dataStore.claims.filter((c) => c.pubkey === $keysStore[0].publicKey).map(c=>c.offerId));
	const offers = $derived([...dataStore.offers.filter(o=> offerIds.includes(o.id))]?.sort((a,b )=> b.createdAt - a.createdAt));
		
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
	{offers?.length} offers.
</p>
{#if offers?.length}
	{#each pageItems as offer}
		<Card.Root class="w-80">
			<Card.Header>
				<Card.Title>Pay {formatCurrency(offer.amount, OPENPLEB_CURRENCY)}</Card.Title>
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
			<Card.Footer class="justify-between">
				<Button href={`/earn/${offer.id}`}> 
					View
				</Button>
				<Badge>
					{offer.status}
				</Badge>
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