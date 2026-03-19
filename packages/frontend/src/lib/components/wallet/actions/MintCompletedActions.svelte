<script lang="ts">
	import { Copy, CheckCircle } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { HistoryEntry } from 'coco-cashu-core';
	import { copyTextToClipboard } from '$lib/utils';

	interface Props {
		item: HistoryEntry;
	}

	let { item }: Props = $props();

	const invoice = $derived((item as Record<string, unknown>).invoice || (item as Record<string, unknown>).request || '');
</script>

<div class="space-y-4">
	<div class="rounded-lg bg-green-50 dark:bg-green-950 p-4 flex items-center gap-3">
		<CheckCircle class="h-5 w-5 text-green-600 dark:text-green-400" />
		<div>
			<p class="font-medium text-green-900 dark:text-green-100">Payment Received</p>
			<p class="text-sm text-green-700 dark:text-green-300">
				Tokens have been added to your wallet
			</p>
		</div>
	</div>

	{#if invoice}
		<div class="rounded-lg border bg-card p-4">
			<div class="mb-2 flex items-center justify-between">
				<p class="text-sm font-medium">Invoice</p>
				<Button
					variant="ghost"
					size="sm"
					onclick={() => {
						copyTextToClipboard(invoice as string, 'invoice');
					}}
				>
					<Copy class="h-4 w-4" />
				</Button>
			</div>
			<div class="break-all rounded bg-muted p-3 text-xs font-mono">
				{invoice}
			</div>
		</div>
	{/if}
</div>
