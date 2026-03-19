<script lang="ts">
	import { ArrowDownLeft, ArrowUpRight, Zap, Coins, ArrowLeft } from '@lucide/svelte';
	import type { HistoryEntry } from 'coco-cashu-core';
	import Button from '$lib/components/ui/button/button.svelte';
	import MintPendingActions from './actions/MintPendingActions.svelte';
	import MintCompletedActions from './actions/MintCompletedActions.svelte';
	import ReceivePendingActions from './actions/ReceivePendingActions.svelte';
	import ReceiveCompletedActions from './actions/ReceiveCompletedActions.svelte';
	import MeltPendingActions from './actions/MeltPendingActions.svelte';
	import MeltCompletedActions from './actions/MeltCompletedActions.svelte';
	import SendPendingActions from './actions/SendPendingActions.svelte';
	import SendCompletedActions from './actions/SendCompletedActions.svelte';

	interface Props {
		item: HistoryEntry;
		onRefresh: () => Promise<void>;
		onBack: () => void;
	}

	let { item, onRefresh, onBack }: Props = $props();

	const typeConfig = $derived.by(() => {
		switch (item.type) {
			case 'mint':
				return {
					icon: ArrowDownLeft,
					label: 'Receive via Lightning',
					color: 'text-primary'
				};
			case 'melt':
				return {
					icon: ArrowUpRight,
					label: 'Send via Lightning',
					color: 'text-primary'
				};
			case 'receive':
				return {
					icon: Coins,
					label: 'Receive Cashu',
					color: 'text-accent'
				};
			case 'send':
				return {
					icon: Coins,
					label: 'Send Cashu',
					color: 'text-accent'
				};
			default:
				return {
					icon: Zap,
					label: 'Transaction',
					color: 'text-muted-foreground'
				};
		}
	});

	const isCompleted = $derived('state' in item && (item.state === 'ISSUED' || item.state === 'finalized' )|| item.type === "receive");
	const statusLabel = $derived(isCompleted ? 'Completed' : 'Pending');
	const formattedAmount = $derived(item.amount.toLocaleString());
	const formattedDate = $derived(new Date(item.createdAt).toLocaleString());
</script>

<div class="flex flex-col h-full">
	<!-- Back Button -->
	<div class="mb-2">
		<Button variant="ghost" size="sm" onclick={onBack}>
			<ArrowLeft class="h-4 w-4 mr-1" />
			Back
		</Button>
	</div>
	
	<!-- Header -->
	<div class="border-b p-4">
		<div class="flex items-center gap-3 mb-3">
			<div class="rounded-full bg-primary/10 p-2">
				<svelte:component this={typeConfig.icon} class={`h-5 w-5 ${typeConfig.color}`} />
			</div>
			<div class="flex-1">
				<h2 class="text-lg font-semibold">{typeConfig.label}</h2>
				<p class="text-sm text-muted-foreground">{statusLabel}</p>
			</div>
		</div>

		<!-- Amount -->
		<div class="rounded-lg bg-muted p-4">
			<p class="text-sm text-muted-foreground mb-1">Amount</p>
			<p class="text-2xl font-bold">{formattedAmount} sats</p>
		</div>
	</div>

	<!-- Content -->
	<div class="flex-1 overflow-y-auto p-4">
		<div class="space-y-4">
			<!-- Transaction Details -->
			<div class="space-y-2">
				<div class="flex justify-between text-sm">
					<span class="text-muted-foreground">Date</span>
					<span class="font-medium">{formattedDate}</span>
				</div>
			</div>

			<div class="border-t pt-4">
				<!-- Dynamic Actions based on type and status -->
				{#if item.type === 'mint'}
					<!-- Mint -->
					{#if isCompleted}
						<MintCompletedActions {item} />
					{:else}
						<MintPendingActions {item} {onRefresh} />
					{/if}
				{:else if item.type === 'melt'}
					<!-- Melt -->
					{#if isCompleted}
						<MeltCompletedActions {item} />
					{:else}
						<MeltPendingActions {item} {onRefresh} />
					{/if}
				{:else if item.type === 'receive'}
					<!-- Receive -->
					{#if isCompleted}
						<ReceiveCompletedActions {item} />
					{:else}
						<ReceivePendingActions {item} {onRefresh} />
					{/if}
				{:else if item.type === 'send'}
					<!-- Send -->
					{#if isCompleted}
						<SendCompletedActions {item} />
					{:else}
						<SendPendingActions {item} {onRefresh} />
					{/if}
				{/if}
			</div>
		</div>
	</div>
</div>
