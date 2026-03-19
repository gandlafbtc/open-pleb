<script lang="ts">
	import { RefreshCw, Copy } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { HistoryEntry } from 'coco-cashu-core';
	import { copyTextToClipboard } from '$lib/utils';
	import encodeQR from 'qr';
	import QR from '$lib/elements/qr/QR.svelte';

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

	// Get invoice from item metadata if available
	const invoice = $derived((item as any).paymentRequest || (item as any).request || '');
</script>

<div class="space-y-4">
	{#if invoice}
		<div class="rounded-lg border bg-card p-4">
			<div class="mb-2 flex items-center justify-between">
				<p class="text-sm font-medium">Lightning Invoice</p>
				<Button
					variant="ghost"
					size="sm"
					onclick={() => {
						copyTextToClipboard(invoice, 'invoice');
					}}
				>
					<Copy class="h-4 w-4" />
				</Button>
			</div>
			<div class="break-all rounded bg-muted p-3 text-xs font-mono mb-3">
				{invoice}
			</div>
			<div class="bg-white rounded-md p-2">
				<QR data={invoice}></QR>
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
		<p>Waiting for payment. Share the invoice or QR code to receive payment.</p>
	</div>
</div>
