<script lang="ts">
	import { RefreshCw, Copy } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { getEncodedToken, type SendHistoryEntry } from 'coco-cashu-core';
	import { copyTextToClipboard } from '$lib/utils';
	import QR from '$lib/elements/qr/QR.svelte';

	interface Props {
		item: SendHistoryEntry;
		onRefresh: () => Promise<void>;
	}

	let { item, onRefresh }: Props = $props();
	let isRefreshing = $state(false);

	// Compute token string once to avoid state mutation i
	const tokenString = item.token ? getEncodedToken(item.token) : null

	async function handleRefresh() {
		isRefreshing = true;
		try {
			await onRefresh();
		} finally {
			isRefreshing = false;
		}
	}

</script>

<div class="space-y-4">
	{#if item.token}
		<div class="rounded-lg border bg-card p-4">
			<div class="mb-2 flex items-center justify-between">
				<p class="text-sm font-medium">Cashu Token</p>
				<Button
					variant="ghost"
					size="sm"
					onclick={() => {
						copyTextToClipboard(tokenString as string, 'token');
					}}
				>
					<Copy class="h-4 w-4" />
				</Button>
			</div>
			<div class="break-all rounded bg-muted p-3 text-xs font-mono mb-3 h-14 text-ellipsis overflow-hidden">
				{tokenString}
			</div>
			<div class=" rounded-md p-2">
				<QR data={tokenString??''}></QR>
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
		<p>Share this token with the recipient. They can redeem it to receive the sats.</p>
	</div>
</div>
