<script lang="ts">
	import { page } from '$app/state';
	import { dataStore } from '$lib/stores/session/data.svelte';
	import { OFFER_STATE } from '@openPleb/common/types';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { MediaQuery } from 'svelte/reactivity';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import ClaimOfferCard from './earn/components/ClaimOfferCard.svelte';
	import SelectProvider from '../SelectProvider.svelte';
	import type { FiatProvider } from '@openPleb/common/db/schema';
	import { X } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';

	const id = Number.parseInt(page.params.id);
	const offers = $derived(dataStore.offers.filter((o) => o.status === OFFER_STATE.INVOICE_PAID));
	let provider: FiatProvider | undefined = $state()
	const isDesktop = new MediaQuery('(min-width: 768px)');

	const count = $derived(offers.length);

	const perPage = $derived(isDesktop.current ? 10 : 5);
	const siblingCount = $derived(isDesktop.current ? 1 : 0);
	let currentPage = $state(1);
	const filteredItems = $derived.by(() => {
		if (!provider) {
			return offers;
		}
		return offers.filter((o) => o.fiatProviderId === provider?.id);
	});
	const pageItems = $derived.by(() => {
		const start = (currentPage - 1) * perPage;
		const end = start + perPage;
		return filteredItems.slice(start, end);
	});

</script>
<div class="flex gap-2">
	<SelectProvider bind:provider></SelectProvider>
	{#if provider}
	<Button variant="ghost" onclick={() => provider=undefined}>

		<X>
		</X>
		
	</Button>	
	{/if}
</div>
<p>
	{offers?.length} offers available.
</p>
{#if offers?.length}
	{#each pageItems as offer}
		<ClaimOfferCard {offer}></ClaimOfferCard>
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
					{#if page.type === 'ellipsis'}
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
