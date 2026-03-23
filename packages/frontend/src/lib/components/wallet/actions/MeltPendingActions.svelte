<script lang="ts">
	import {  Copy } from '@lucide/svelte';
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
	{#if invoice}
		<div class="rounded-lg border bg-card p-4">
			<div class="mb-2 flex items-center justify-between">
				<p class="text-sm font-medium">Lightning Invoice</p>
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

	<div class="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
		<p>Payment in progress. Waiting for Lightning payment confirmation.</p>
	</div>
</div>
