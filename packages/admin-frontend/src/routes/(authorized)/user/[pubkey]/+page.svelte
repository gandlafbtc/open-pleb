<script lang="ts">
	import { onMount } from 'svelte';
	import { dataStore } from '$lib/stores/data.svelte';
	import { OFFER_STATE } from '@openPleb/common/types';
	import * as Tabs from '$lib/components/ui/tabs/index';
	import * as Table from '$lib/components/ui/table/index';
	import {
		type ColumnDef,
		type ColumnFiltersState,
		type PaginationState,
		type SortingState,
		type VisibilityState,
		getCoreRowModel,
		getFilteredRowModel,
		getPaginationRowModel,
		getSortedRowModel
	} from '@tanstack/table-core';
	import { FlexRender, createSvelteTable, renderSnippet } from '$lib/components/ui/data-table/index';
	import { createRawSnippet } from 'svelte';
	import { Button } from '$lib/components/ui/button/index';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card/index';
	import { goto } from '$app/navigation';
	import { formatCurrency } from '$lib/helper';
	import { page } from '$app/state';

	
	// Get the pubkey from the URL query parameter
	let pubkey = $state(page.params.pubkey);
	
	onMount(() => {
		dataStore.fetchForPubkey(pubkey)
	})

	// Filter offers, claims and receipts by the pubkey
	let userOffers = $derived(dataStore.offers.filter(offer => offer.pubkey === pubkey));
	let userClaims = $derived(dataStore.claims.filter(claim => claim.pubkey === pubkey));
	let userReceipts = $derived(dataStore.receipts.filter(receipt => receipt.pubkey === pubkey));

	// Calculate statistics
	let totalOffers = $derived(userOffers.length);
	let totalClaims = $derived(userClaims.length);
	let totalReceipts = $derived(userReceipts.length);
	
	let completedOffers = $derived(userOffers.filter(o => o.status === OFFER_STATE.COMPLETED).length);
	let resolvedOffers = $derived(userOffers.filter(o => o.status === OFFER_STATE.RESOLVED).length);
	let expiredOffers = $derived(userOffers.filter(o => o.status === OFFER_STATE.EXPIRED).length);
	let disputedOffers = $derived(userOffers.filter(o => o.status === OFFER_STATE.DISPUTED).length);
	
	let completedPercentage = $derived(totalOffers > 0 ? Math.round((completedOffers / totalOffers) * 100) : 0);
	let resolvedPercentage = $derived(totalOffers > 0 ? Math.round((resolvedOffers / totalOffers) * 100) : 0);
	let expiredPercentage = $derived(totalOffers > 0 ? Math.round((expiredOffers / totalOffers) * 100) : 0);
	let disputedPercentage = $derived(totalOffers > 0 ? Math.round((disputedOffers / totalOffers) * 100) : 0);

	// Find the user info for this pubkey if available
	// Note: userInfos may not be available in the data store
	let userInfo = $derived(() => {
		// @ts-ignore - userInfos might be available in some contexts
		return dataStore.userInfos ? dataStore.userInfos.find((u: any) => u?.pubkey === pubkey) : undefined;
	});

	// Format date helper
	const formatDate = (timestamp: number | undefined) => {
		if (!timestamp) return 'N/A';
		return new Date(timestamp * 1000).toLocaleString();
	};

	// Tabs state
	let activeTab = $state('offers');

	// Table state for offers
	let offersPagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
	let offersSorting = $state<SortingState>([]);
	let offersColumnFilters = $state<ColumnFiltersState>([]);
	let offersColumnVisibility = $state<VisibilityState>({});

	// Table state for claims
	let claimsPagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
	let claimsSorting = $state<SortingState>([]);
	let claimsColumnFilters = $state<ColumnFiltersState>([]);
	let claimsColumnVisibility = $state<VisibilityState>({});

	// Table state for receipts
	let receiptsPagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
	let receiptsSorting = $state<SortingState>([]);
	let receiptsColumnFilters = $state<ColumnFiltersState>([]);
	let receiptsColumnVisibility = $state<VisibilityState>({});

	// Columns definition for offers table
	// Using Record<string, any> as a type for table rows
	const offersColumns: ColumnDef<unknown>[] = [
		{
			accessorKey: 'id',
			header: 'ID',
			cell: ({ row }) => {
				const idSnippet = createRawSnippet<[string]>((getId) => {
					const id = getId();
					return {
						render: () => `<div class="font-medium">${id}</div>`
					};
				});
				return renderSnippet(idSnippet, row.getValue('id'));
			}
		},
		{
			accessorKey: 'status',
			header: 'Status',
			cell: ({ row }) => {
				const statusSnippet = createRawSnippet<[string]>((getStatus) => {
					const status = getStatus();
					return {
						render: () => `<div class="capitalize">${status}</div>`
					};
				});
				return renderSnippet(statusSnippet, row.getValue('status'));
			}
		},
		{
			accessorKey: 'createdAt',
			header: 'Created at',
			cell: ({ row }) => {
				const dateSnippet = createRawSnippet<[string]>((getDate) => {
					const date = getDate();
					return {
						render: () => `<div>${date}</div>`
					};
				});
				return renderSnippet(dateSnippet, formatDate(row.getValue('createdAt')));
			}
		},
		{
			accessorKey: 'amount',
			header: 'Amount',
			cell: ({ row }) => {
				const amountSnippet = createRawSnippet<[string]>((getAmount) => {
					const amount = getAmount();
					return {
						render: () => `<div class="text-right font-medium">${amount}</div>`
					};
				});
				const formatter = new Intl.NumberFormat('en-US', {
					style: 'currency',
					currency: dataStore.env?.OPENPLEB_CURRENCY
				});

				return renderSnippet(
					amountSnippet,
					formatter.format(Number.parseFloat(row.getValue('amount')))
				);
			}
		},
		{
			accessorKey: 'satsAmount',
			header: 'Sats Amount',
			cell: ({ row }) => {
				const satsSnippet = createRawSnippet<[string]>((getSats) => {
					const sats = getSats();
					return {
						render: () => `<div class="text-right font-medium">${sats}</div>`
					};
				});
				return renderSnippet(satsSnippet, formatCurrency(row.getValue('satsAmount'), 'SAT'));
			}
		}
	];

	// Columns definition for claims table
	const claimsColumns: ColumnDef<unknown>[] = [
		{
			accessorKey: 'id',
			header: 'ID',
			cell: ({ row }) => {
				const idSnippet = createRawSnippet<[string]>((getId) => {
					const id = getId();
					return {
						render: () => `<div class="font-medium">${id}</div>`
					};
				});
				return renderSnippet(idSnippet, row.getValue('id'));
			}
		},
		{
			accessorKey: 'offerId',
			header: 'Offer ID',
			cell: ({ row }) => {
				const idSnippet = createRawSnippet<[string]>((getId) => {
					const id = getId();
					return {
						render: () => `<div class="font-medium">${id}</div>`
					};
				});
				return renderSnippet(idSnippet, row.getValue('offerId'));
			}
		},
		{
			accessorKey: 'createdAt',
			header: 'Created at',
			cell: ({ row }) => {
				const dateSnippet = createRawSnippet<[string]>((getDate) => {
					const date = getDate();
					return {
						render: () => `<div>${date}</div>`
					};
				});
				return renderSnippet(dateSnippet, formatDate(row.getValue('createdAt')));
			}
		},
		{
			accessorKey: 'reward',
			header: 'Reward',
			cell: ({ row }) => {
				const rewardSnippet = createRawSnippet<[string]>((getReward) => {
					const reward = getReward();
					return {
						render: () => `<div class="text-right font-medium">${reward || 'N/A'}</div>`
					};
				});
				return renderSnippet(rewardSnippet, row.getValue('reward'));
			}
		}
	];

	// Columns definition for receipts table
	const receiptsColumns: ColumnDef<any>[] = [
		{
			accessorKey: 'id',
			header: 'ID',
			cell: ({ row }) => {
				const idSnippet = createRawSnippet<[string]>((getId) => {
					const id = getId();
					return {
						render: () => `<div class="font-medium">${id}</div>`
					};
				});
				return renderSnippet(idSnippet, row.getValue('id'));
			}
		},
		{
			accessorKey: 'offerId',
			header: 'Offer ID',
			cell: ({ row }) => {
				const idSnippet = createRawSnippet<[string]>((getId) => {
					const id = getId();
					return {
						render: () => `<div class="font-medium">${id}</div>`
					};
				});
				return renderSnippet(idSnippet, row.getValue('offerId'));
			}
		},
		{
			accessorKey: 'createdAt',
			header: 'Created at',
			cell: ({ row }) => {
				const dateSnippet = createRawSnippet<[string]>((getDate) => {
					const date = getDate();
					return {
						render: () => `<div>${date}</div>`
					};
				});
				return renderSnippet(dateSnippet, formatDate(row.getValue('createdAt')));
			}
		},
		{
			accessorKey: 'receiptImg',
			header: 'Receipt Image',
			cell: ({ row }) => {
				const hasImage = row.getValue('receiptImg') ? true : false;
				const imageSnippet = createRawSnippet<[boolean]>((hasImage) => {
					return {
						render: () => `<div class="text-center">${hasImage ? '✓' : '✗'}</div>`
					};
				});
				return renderSnippet(imageSnippet, hasImage);
			}
		}
	];

	// Create table objects
	const offersTable = $derived(createSvelteTable({
		data: userOffers,
		columns: offersColumns,
		state: {
			get pagination() {
				return offersPagination;
			},
			get sorting() {
				return offersSorting;
			},
			get columnVisibility() {
				return offersColumnVisibility;
			},
			get columnFilters() {
				return offersColumnFilters;
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				offersPagination = updater(offersPagination);
			} else {
				offersPagination = updater;
			}
		},
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				offersSorting = updater(offersSorting);
			} else {
				offersSorting = updater;
			}
		},
		onColumnFiltersChange: (updater) => {
			if (typeof updater === 'function') {
				offersColumnFilters = updater(offersColumnFilters);
			} else {
				offersColumnFilters = updater;
			}
		},
		onColumnVisibilityChange: (updater) => {
			if (typeof updater === 'function') {
				offersColumnVisibility = updater(offersColumnVisibility);
			} else {
				offersColumnVisibility = updater;
			}
		}
	}));

	const claimsTable = $derived(createSvelteTable({
		data: userClaims,
		columns: claimsColumns,
		state: {
			get pagination() {
				return claimsPagination;
			},
			get sorting() {
				return claimsSorting;
			},
			get columnVisibility() {
				return claimsColumnVisibility;
			},
			get columnFilters() {
				return claimsColumnFilters;
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				claimsPagination = updater(claimsPagination);
			} else {
				claimsPagination = updater;
			}
		},
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				claimsSorting = updater(claimsSorting);
			} else {
				claimsSorting = updater;
			}
		},
		onColumnFiltersChange: (updater) => {
			if (typeof updater === 'function') {
				claimsColumnFilters = updater(claimsColumnFilters);
			} else {
				claimsColumnFilters = updater;
			}
		},
		onColumnVisibilityChange: (updater) => {
			if (typeof updater === 'function') {
				claimsColumnVisibility = updater(claimsColumnVisibility);
			} else {
				claimsColumnVisibility = updater;
			}
		}
	}));

	const receiptsTable = $derived(createSvelteTable({
		data: userReceipts,
		columns: receiptsColumns,
		state: {
			get pagination() {
				return receiptsPagination;
			},
			get sorting() {
				return receiptsSorting;
			},
			get columnVisibility() {
				return receiptsColumnVisibility;
			},
			get columnFilters() {
				return receiptsColumnFilters;
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				receiptsPagination = updater(receiptsPagination);
			} else {
				receiptsPagination = updater;
			}
		},
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				receiptsSorting = updater(receiptsSorting);
			} else {
				receiptsSorting = updater;
			}
		},
		onColumnFiltersChange: (updater) => {
			if (typeof updater === 'function') {
				receiptsColumnFilters = updater(receiptsColumnFilters);
			} else {
				receiptsColumnFilters = updater;
			}
		},
		onColumnVisibilityChange: (updater) => {
			if (typeof updater === 'function') {
				receiptsColumnVisibility = updater(receiptsColumnVisibility);
			} else {
				receiptsColumnVisibility = updater;
			}
		}
	}));
</script>

<div class="w-full mx-auto max-w-7xl">
	<div class="mb-8">
		<h1 class="text-2xl font-bold mb-4">User Profile</h1>
		<p class="text-sm text-muted-foreground mb-2">Pubkey: {pubkey}</p>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
			<!-- Statistics Cards -->
			<Card>
				<CardHeader class="pb-2">
					<CardTitle class="text-lg font-medium">Offers</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="text-3xl font-bold">{totalOffers}</div>
					<p class="text-xs text-muted-foreground">
						{completedPercentage}% completed, {resolvedPercentage}% resolved, {expiredPercentage}% expired
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader class="pb-2">
					<CardTitle class="text-lg font-medium">Claims</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="text-3xl font-bold">{totalClaims}</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader class="pb-2">
					<CardTitle class="text-lg font-medium">Receipts</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="text-3xl font-bold">{totalReceipts}</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader class="pb-2">
					<CardTitle class="text-lg font-medium">Disputes</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="text-3xl font-bold">{disputedOffers}</div>
					<p class="text-xs text-muted-foreground">
						{disputedPercentage}% of offers
					</p>
				</CardContent>
			</Card>
		</div>
	</div>

	<!-- Tabs for Offers, Claims, and Receipts -->
	<Tabs.Root value={activeTab} onValueChange={(v) => activeTab = v}>
		<Tabs.List class="mb-4">
			<Tabs.Trigger value="offers">Offers</Tabs.Trigger>
			<Tabs.Trigger value="claims">Claims</Tabs.Trigger>
			<Tabs.Trigger value="receipts">Receipts</Tabs.Trigger>
		</Tabs.List>

		<!-- Offers Tab -->
		<Tabs.Content value="offers">
			<div class="rounded-md border">
				<Table.Root>
					<Table.Header>
						{#each offersTable.getHeaderGroups() as headerGroup (headerGroup.id)}
							<Table.Row>
								{#each headerGroup.headers as header (header.id)}
									<Table.Head class="[&:has([role=checkbox])]:pl-3">
										{#if !header.isPlaceholder}
											<FlexRender
												content={header.column.columnDef.header}
												context={header.getContext()}
											/>
										{/if}
									</Table.Head>
								{/each}
							</Table.Row>
						{/each}
					</Table.Header>
					<Table.Body>
						{#each offersTable.getRowModel().rows as row (row.id)}
							<Table.Row class="cursor-pointer" onclick={()=> goto(`/offer/${row.getValue("id")}`)} data-state={row.getIsSelected() && 'selected'}>
								{#each row.getVisibleCells() as cell (cell.id)}
									<Table.Cell class="[&:has([role=checkbox])]:pl-3">
										<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
									</Table.Cell>
								{/each}
							</Table.Row>
						{:else}
							<Table.Row>
								<Table.Cell colspan={offersColumns.length} class="h-24 text-center">No offers found.</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
			<div class="flex items-center justify-end space-x-2 py-4">
				<div class="space-x-2">
					<Button
						variant="outline"
						size="sm"
						onclick={() => offersTable.previousPage()}
						disabled={!offersTable.getCanPreviousPage()}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onclick={() => offersTable.nextPage()}
						disabled={!offersTable.getCanNextPage()}
					>
						Next
					</Button>
				</div>
			</div>
		</Tabs.Content>

		<!-- Claims Tab -->
		<Tabs.Content value="claims">
			<div class="rounded-md border">
				<Table.Root>
					<Table.Header>
						{#each claimsTable.getHeaderGroups() as headerGroup (headerGroup.id)}
							<Table.Row>
								{#each headerGroup.headers as header (header.id)}
									<Table.Head class="[&:has([role=checkbox])]:pl-3">
										{#if !header.isPlaceholder}
											<FlexRender
												content={header.column.columnDef.header}
												context={header.getContext()}
											/>
										{/if}
									</Table.Head>
								{/each}
							</Table.Row>
						{/each}
					</Table.Header>
					<Table.Body>
						{#each claimsTable.getRowModel().rows as row (row.id)}
							<Table.Row data-state={row.getIsSelected() && 'selected'}>
								{#each row.getVisibleCells() as cell (cell.id)}
									<Table.Cell class="[&:has([role=checkbox])]:pl-3">
										<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
									</Table.Cell>
								{/each}
							</Table.Row>
						{:else}
							<Table.Row>
								<Table.Cell colspan={claimsColumns.length} class="h-24 text-center">No claims found.</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
			<div class="flex items-center justify-end space-x-2 py-4">
				<div class="space-x-2">
					<Button
						variant="outline"
						size="sm"
						onclick={() => claimsTable.previousPage()}
						disabled={!claimsTable.getCanPreviousPage()}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onclick={() => claimsTable.nextPage()}
						disabled={!claimsTable.getCanNextPage()}
					>
						Next
					</Button>
				</div>
			</div>
		</Tabs.Content>

		<!-- Receipts Tab -->
		<Tabs.Content value="receipts">
			<div class="rounded-md border">
				<Table.Root>
					<Table.Header>
						{#each receiptsTable.getHeaderGroups() as headerGroup (headerGroup.id)}
							<Table.Row>
								{#each headerGroup.headers as header (header.id)}
									<Table.Head class="[&:has([role=checkbox])]:pl-3">
										{#if !header.isPlaceholder}
											<FlexRender
												content={header.column.columnDef.header}
												context={header.getContext()}
											/>
										{/if}
									</Table.Head>
								{/each}
							</Table.Row>
						{/each}
					</Table.Header>
					<Table.Body>
						{#each receiptsTable.getRowModel().rows as row (row.id)}
							<Table.Row data-state={row.getIsSelected() && 'selected'}>
								{#each row.getVisibleCells() as cell (cell.id)}
									<Table.Cell class="[&:has([role=checkbox])]:pl-3">
										<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
									</Table.Cell>
								{/each}
							</Table.Row>
						{:else}
							<Table.Row>
								<Table.Cell colspan={receiptsColumns.length} class="h-24 text-center">No receipts found.</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
			<div class="flex items-center justify-end space-x-2 py-4">
				<div class="space-x-2">
					<Button
						variant="outline"
						size="sm"
						onclick={() => receiptsTable.previousPage()}
						disabled={!receiptsTable.getCanPreviousPage()}
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onclick={() => receiptsTable.nextPage()}
						disabled={!receiptsTable.getCanNextPage()}
					>
						Next
					</Button>
				</div>
			</div>
		</Tabs.Content>
	</Tabs.Root>
</div>
