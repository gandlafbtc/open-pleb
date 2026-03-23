<script lang="ts">
	import {  Copy } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { HistoryEntry } from 'coco-cashu-core';
	import { copyTextToClipboard } from '$lib/utils';

	interface Props {
		item: HistoryEntry;
	}

	let { item,  }: Props = $props();


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

	<div class="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
		<p>Waiting to receive Cashu tokens.</p>
	</div>
</div>
