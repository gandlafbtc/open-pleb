<script lang="ts">
	import { Copy, CheckCircle } from '@lucide/svelte';
	import type { HistoryEntry } from 'coco-cashu-core';

	interface Props {
		item: HistoryEntry;
	}

	let { item }: Props = $props();

</script>

<div class="space-y-4">
	<div class="rounded-lg bg-green-50 dark:bg-green-950 p-4 flex items-center gap-3">
		<CheckCircle class="h-5 w-5 text-green-600 dark:text-green-400" />
		<div>
			<p class="font-medium text-green-900 dark:text-green-100">Tokens Received</p>
			<p class="text-sm text-green-700 dark:text-green-300">
				Cashu tokens have been added to your wallet
			</p>
		</div>
	</div>

</div>
