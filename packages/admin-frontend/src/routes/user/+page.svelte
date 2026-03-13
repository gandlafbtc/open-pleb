<script lang="ts">
	import { onMount } from 'svelte';
	import { loadUsers } from '$lib/services/user.service';
	import { usersState } from '$lib/state/users.svelte';
	import InviteCodes from '$lib/components/InviteCodes.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Alert from '$lib/components/ui/alert';
	import * as Table from '$lib/components/ui/table';
	import { Loader2, UserPlus, Users, CheckCircle, XCircle, Copy } from '@lucide/svelte';
	import { createSvelteTable } from '$lib/components/ui/data-table/data-table.svelte';
	import {
		getCoreRowModel,
		getPaginationRowModel,
		type ColumnDef,
		type PaginationState
	} from '@tanstack/table-core';
	import type { User } from 'common/db/schema';
	import { copyTextToClipboard } from '$lib/utils';

	// State management using Svelte runes
	let showInviteCodes = $state(false);
	let pagination = $state<PaginationState>({
		pageIndex: 0,
		pageSize: 10
	});

	// Column definitions for the table
	const columns: ColumnDef<User>[] = [
		{
			accessorKey: 'inviteCode',
			header: 'Invite Code',
			cell: (info) => {
				const code = info.getValue() as string | null;
				return code;
			}
		},
		{
			accessorKey: 'codeCreatedAt',
			header: 'Created At',
			cell: (info) => {
				const timestamp = info.getValue() as number;
				return new Date(timestamp * 1000).toLocaleString();
			}
		},
		{
			accessorKey: 'usedAt',
			header: 'Status',
			cell: (info) => {
				const usedAt = info.getValue() as number | null;
				return usedAt ? 'Used' : 'Unused';
			}
		},
		{
			accessorKey: 'usedAt',
			header: 'Used At',
			cell: (info) => {
				const usedAt = info.getValue() as number | null;
				return usedAt ? new Date(usedAt * 1000).toLocaleString() : '-';
			}
		},
		{
			accessorKey: 'npub',
			header: 'Npub',
			cell: (info) => {
				const npub = info.getValue() as string | null;
				if (!npub) return '-';
				return `${npub.substring(0, 12)}...${npub.substring(npub.length - 8)}`;
			}
		}
	];

	// Create table instance
	const table = createSvelteTable({
		get data() {
			return usersState.users;
		},
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				pagination = updater(pagination);
			} else {
				pagination = updater;
			}
		},
		state: {
			get pagination() {
				return pagination;
			}
		}
	});

	function toggleInviteCodes() {
		showInviteCodes = !showInviteCodes;
	}

	onMount(() => {
		loadUsers();
	});
</script>

<div class="space-y-6">
	<!-- Header Section -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">User Management</h1>
			<p class="text-muted-foreground">Manage invite codes and view registered users</p>
		</div>
		<Button onclick={toggleInviteCodes} variant={showInviteCodes ? 'secondary' : 'default'}>
			<UserPlus class="mr-2 h-4 w-4" />
			{showInviteCodes ? 'Hide Invite Codes' : 'Invite New Users'}
		</Button>
	</div>

	<!-- Invite Codes Section (Conditional) -->
	{#if showInviteCodes}
		<InviteCodes />
	{/if}

	<!-- Statistics Cards -->
	<div class="grid gap-4 md:grid-cols-3">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Total Invites</Card.Title>
				<Users class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{usersState.usedCount + usersState.unusedCount}</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Used Codes</Card.Title>
				<CheckCircle class="h-4 w-4 text-green-500" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{usersState.usedCount}</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Unused Codes</Card.Title>
				<XCircle class="h-4 w-4 text-orange-500" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{usersState.unusedCount}</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Users Table -->
	<Card.Root>
		<Card.Header>
			<div class="flex items-center justify-between">
				<div>
					<Card.Title>Users</Card.Title>
					<Card.Description>A list of all invite codes and their usage status</Card.Description>
				</div>
				<Button variant="outline" size="sm" onclick={() => loadUsers()} disabled={usersState.isLoading}>
					{#if usersState.isLoading}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						Loading...
					{:else}
						Refresh
					{/if}
				</Button>
			</div>
		</Card.Header>
		<Card.Content>
			{#if usersState.error}
				<Alert.Root variant="destructive">
					<Alert.Description>{usersState.error}</Alert.Description>
				</Alert.Root>
			{:else if usersState.isLoading && usersState.users.length === 0}
				<div class="flex items-center justify-center py-8">
					<Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			{:else if usersState.users.length === 0}
				<div class="flex flex-col items-center justify-center py-8 text-center">
					<Users class="h-12 w-12 text-muted-foreground mb-4" />
					<p class="text-lg font-medium">No users found</p>
					<p class="text-sm text-muted-foreground">Generate invite codes to get started</p>
				</div>
			{:else}
				<div class="rounded-md border">
					<Table.Root>
						<Table.Header>
							{#each table.getHeaderGroups() as headerGroup}
								<Table.Row>
									{#each headerGroup.headers as header}
										<Table.Head>
											{#if !header.isPlaceholder}
												{#if typeof header.column.columnDef.header === 'string'}
													{header.column.columnDef.header}
												{/if}
											{/if}
										</Table.Head>
									{/each}
								</Table.Row>
							{/each}
						</Table.Header>
						<Table.Body>
							{#each table.getRowModel().rows as row}
								<Table.Row>
									{#each row.getVisibleCells() as cell}
										<Table.Cell>
											{#if cell.column.id === 'inviteCode'}
												{@const code = cell.getValue() as string | null}
												{#if code}
													<div class="flex items-center gap-2">
														<span class="font-mono text-sm">{code}</span>
														<Button
															variant="ghost"
															size="icon"
															class="h-8 w-8"
															onclick={() => copyTextToClipboard(code, 'invite code')}
														>
															<Copy class="h-4 w-4" />
														</Button>
													</div>
												{:else}
													-
												{/if}
											{:else if typeof cell.column.columnDef.cell === 'function'}
												{@const value = cell.column.columnDef.cell(cell.getContext())}
												{value}
											{:else}
												{cell.getValue()}
											{/if}
										</Table.Cell>
									{/each}
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>

				<!-- Pagination -->
				<div class="flex items-center justify-between space-x-2 py-4">
					<div class="text-sm text-muted-foreground">
						Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize +
							1} to {Math.min(
							(table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
							usersState.users.length
						)} of {usersState.users.length} users
					</div>
					<div class="flex space-x-2">
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
			{/if}
		</Card.Content>
	</Card.Root>
</div>
