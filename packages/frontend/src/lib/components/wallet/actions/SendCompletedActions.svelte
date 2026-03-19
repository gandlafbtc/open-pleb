<script lang="ts">
	import { Copy, CheckCircle } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { HistoryEntry } from 'coco-cashu-core';
	import { copyTextToClipboard } from '$lib/utils';

	interface Props {
		item: HistoryEntry;
	}

	let { item }: Props = $props();

	const token = $derived((item as Record<string, unknown>).token || '');
</script>

<div class="space-y-4">
	<div class="rounded-lg bg-green-50 dark:bg-green-950 p-4 flex items-center gap-3">
		<CheckCircle class="h-5 w-5 text-green-600 dark:text-green-400" />
		<div>
			<p class="font-medium text-green-900 dark:text-green-100">Tokens Sent</p>
			<p class="text-sm text-green-700 dark:text-green-300">
				Cashu tokens sent successfully
			</p>
		</div>
	</div>

	{#if token}
		<div class="rounded-lg border bg-card p-4">
			<div class="mb-2 flex items-center justify-between">
				<p class="text-sm font-medium">Token</p>
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
</div>
