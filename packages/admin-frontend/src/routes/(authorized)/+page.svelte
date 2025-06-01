<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import {
		type ColumnDef,
		type ColumnFiltersState,
		type PaginationState,
		type RowSelectionState,
		type SortingState,
		type VisibilityState,
		getCoreRowModel,
		getFilteredRowModel,
		getPaginationRowModel,
		getSortedRowModel
	} from '@tanstack/table-core';
	import { createRawSnippet, onMount, untrack } from 'svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import {
		FlexRender,
		createSvelteTable,
		renderComponent,
		renderSnippet
	} from '$lib/components/ui/data-table/index.js';
	import type { Offer } from '@openPleb/common/db/schema';
	import { dataStore } from '$lib/stores/data.svelte';
	import { formatCurrency } from '$lib/helper';
	import RangeSlider from 'svelte-range-slider-pips';
	import { RangeCalendar } from '$lib/components/ui/range-calendar';
	import { getLocalTimeZone, today } from '@internationalized/date';
	import * as Popover from '$lib/components/ui/popover';
	import { date } from 'zod';
	import { goto } from '$app/navigation';
	import { OFFER_STATE } from '@openPleb/common/types';
  
	const formatDate = (timestamp: number | undefined) => {
		if (!timestamp) return 'N/A';
		return new Date(timestamp * 1000).toLocaleString();
	};
	const tz = getLocalTimeZone();

	const maxAmount = $derived(Math.max(...dataStore.offers.map((offer) => offer.amount)) || 0);

	const start = today(tz).add({ days: 1 });
	const end = start.subtract({ months: 3 });

	let datesRange = $state({
		start,
		end
	});

	const columns: ColumnDef<Offer>[] = [
    {
			accessorKey: 'id',
			header: 'ID',
			cell: ({ row }) => {
				const statusSnippet = createRawSnippet<[string]>((getId) => {
					const id = getId();
					return {
						render: () => `<div class="capitalize">${id}</div>`
					};
				});
				return renderSnippet(statusSnippet, row.getValue('id'));
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
			filterFn: 'inNumberRange',
			cell: ({ row }) => {
				const statusSnippet = createRawSnippet<[string]>((getCreatedAt) => {
					const createdAt = getCreatedAt();
					return {
						render: () => `<div class="capitalize">${createdAt}</div>`
					};
				});
				return renderSnippet(statusSnippet, formatDate(row.getValue('createdAt')));
			}
		},
		{
			accessorKey: 'amount',
			header: () => {
				const amountHeaderSnippet = createRawSnippet(() => {
					return {
						render: () => `<div class="text-right">Amount</div>`
					};
				});
				return renderSnippet(amountHeaderSnippet, '');
			},
			cell: ({ row }) => {
				const amountCellSnippet = createRawSnippet<[string]>((getAmount) => {
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
					amountCellSnippet,
					formatter.format(Number.parseFloat(row.getValue('amount')))
				);
			}
		},
		{
			accessorKey: 'satsAmount',
			filterFn: 'inNumberRange',
			header: () => {
				const amountHeaderSnippet = createRawSnippet(() => {
					return {
						render: () => `<div class="text-right">Sats Amount</div>`
					};
				});
				return renderSnippet(amountHeaderSnippet, '');
			},
			cell: ({ row }) => {
				const amountCellSnippet = createRawSnippet<[string]>((getAmount) => {
					const amount = getAmount();
					return {
						render: () => `<div class="text-right font-medium">${amount}</div>`
					};
				});
				const formatter = new Intl.NumberFormat('en-US', {
					style: 'currency',
					currency: 'SAT'
				});

				return renderSnippet(amountCellSnippet, formatCurrency(row.getValue('satsAmount'), 'SAT'));
			}
		}
	];

	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
	let sorting = $state<SortingState>([]);
	let columnFilters = $state<ColumnFiltersState>([]);
	let rowSelection = $state<RowSelectionState>({});
	let columnVisibility = $state<VisibilityState>({});

	const table = $derived(createSvelteTable({
		data: dataStore.offers,
		columns,
		state: {
			get pagination() {
				return pagination;
			},
			get sorting() {
				return sorting;
			},
			get columnVisibility() {
				return columnVisibility;
			},
			get rowSelection() {
				return rowSelection;
			},
			get columnFilters() {
				return columnFilters;
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				pagination = updater(pagination);
			} else {
				pagination = updater;
			}
		},
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
		},
		onColumnFiltersChange: (updater) => {
			if (typeof updater === 'function') {
				columnFilters = updater(columnFilters);
			} else {
				columnFilters = updater;
			}
		},
		onColumnVisibilityChange: (updater) => {
			if (typeof updater === 'function') {
				columnVisibility = updater(columnVisibility);
			} else {
				columnVisibility = updater;
			}
		},
		onRowSelectionChange: (updater) => {
			if (typeof updater === 'function') {
				rowSelection = updater(rowSelection);
			} else {
				rowSelection = updater;
			}
		}
	}));
	$effect(() => {
		if (datesRange) {
			untrack(() => {
				table.getColumn('createdAt')?.setFilterValue((old) => {
					return [
						Math.ceil(datesRange.start.toDate(tz).getTime() / 1000),
						Math.ceil(datesRange.end.toDate(tz).getTime() / 1000)
					];
				});
			});
		}
	});
  $effect(() => {
  })

  onMount(()=> {
	table.getColumn('status')?.setFilterValue(OFFER_STATE.DISPUTED);
  })
</script>

<div class="w-full">
	<div class="flex items-center py-4 gap-2 flex-col lg:flex-row">
		<Input
			placeholder="Filter status..."
			value={(table.getColumn('status')?.getFilterValue() as string) ?? ''}
			oninput={(e) => table.getColumn('status')?.setFilterValue(e.currentTarget.value)}
			onchange={(e) => {
				table.getColumn('status')?.setFilterValue(e.currentTarget.value);
			}}
			class="max-w-sm"
		/>
		<div class="flex items-start gap-2">

			<Popover.Root>
				<Popover.Trigger>
					<Button>
						Date {formatDate(Math.ceil(datesRange.start.toDate(tz).getTime()) / 1000)} - {formatDate(
							Math.ceil(datesRange.end.toDate(tz).getTime()) / 1000
						)}
					</Button>
				</Popover.Trigger>
				<Popover.Content class="w-80">
					<RangeCalendar
						bind:value={datesRange}
						class="rounded-md border"
						onchange={(e) => console.log(e)}
					/>
				</Popover.Content>
			</Popover.Root>
		</div>
		<div class="w-80 flex flex-col gap-2">
        <RangeSlider
        step={500}
        pips={true}
        values={[0,maxAmount]}
        max={maxAmount}
        min={0}
        float={true}

        on:change={
          (e: Event) => {
            console.log(e.detail.values);
          table.getColumn("satsAmount")?.setFilterValue((element)=> {
            return e.detail.values
          })
           
          }
        }
      >
      
    </RangeSlider>
  </div>
	</div>
	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
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
				{#each table.getRowModel().rows as row (row.id)}
					<Table.Row class="cursor-pointer" onclick={()=> goto(`/offer/${row.getValue("id")}`)} data-state={row.getIsSelected() && 'selected'}>
						{#each row.getVisibleCells() as cell (cell.id)}
							<Table.Cell class="[&:has([role=checkbox])]:pl-3">
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</Table.Cell>
						{/each}
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="h-24 text-center">No results.</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<div class="flex items-center justify-end space-x-2 pt-4">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="outline" class="ml-auto">
						Columns <ChevronDown class="ml-2 size-4" />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				{#each table.getAllColumns().filter((col) => col.getCanHide()) as column (column)}
					<DropdownMenu.CheckboxItem
						class="capitalize"
						bind:checked={() => column.getIsVisible(), (v) => column.toggleVisibility(!!v)}
					>
						{column.id}
					</DropdownMenu.CheckboxItem>
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
		<div class="space-x-2">
			<Button
				variant="outline"
				size="sm"
				onclick={() => table.previousPage()}
				disabled={!table.getCanPreviousPage()}
			>
				Previous
			</Button>
			<Button
				variant="outline"
				size="sm"
				onclick={() => table.nextPage()}
				disabled={!table.getCanNextPage()}
			>
				Next
			</Button>
		</div>
	</div>
</div>
