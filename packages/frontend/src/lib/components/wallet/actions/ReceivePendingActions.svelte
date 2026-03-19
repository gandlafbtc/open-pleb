<script lang="ts">
	import { RefreshCw, Copy } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { HistoryEntry } from 'coco-cashu-core';
	import { copyTextToClipboard } from '$lib/utils';

	interface Props {
		item: HistoryEntry;
		onRefresh: () => Promise<void>;
	}

	let { item, onRefresh }: Props = $props();
	let isRefreshing = $state(false);

	async function handleRefresh() {
		isRefreshing = true;
		try {
			await onRefresh();
		} finally {
			isRefreshing = false;
		}
	}

	const token = $derived((item as Record<string, unknown>).token || '');
</script>

<div class="space-y-4">
	{#if token}
		<div class="rounded-lg border bg-card p-4">
			<div class="mb-2 flex items-center justify-between">
				<p class="text-sm font-medium">Cashu Token</p>
				<Button
					variant="ghost"
					size="sm"
					onclick={() => {
						copyTextToClipboard(token as string, 'token');
					}}
				>
					<Copy class="h-4 w-4" />
				</Button>
			</div>
			<div class="break-all rounded bg-muted p-3 text-xs font-mono">
				{token}
			</div>
		</div>
	{/if}

	<div class="flex gap-2">
		<Button onclick={handleRefresh} disabled={isRefreshing} class="w-full" variant="outline">
			<RefreshCw class={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
			{isRefreshing ? 'Checking...' : 'Refresh Status'}
		</Button>
	</div>

	<div class="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
		<p>Waiting to receive Cashu tokens.</p>
	</div>
</div>
