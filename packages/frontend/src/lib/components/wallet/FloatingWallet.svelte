<script lang="ts">
	import {
		Download,
		Landmark,
		LoaderCircle,
		ScanQrCode,
		Upload,
		Wallet
	} from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import * as Sheet from '$lib/components/ui/sheet';
	import { onMount } from 'svelte';
	import type { CocoWallet } from '$lib/state/wallet/wallet.svelte';
	import { env } from '$lib/state/dynamic/env.svelte';
	import { toast } from 'svelte-sonner';
	import { ensureError } from 'common/errors';
	import ReceiveView from './ReceiveView.svelte';

	let wallet: CocoWallet | undefined = $state(undefined);

	let view: 'balance' | 'receive' | 'send' | 'scan' = $state('balance');

	onMount(async () => {
		const { wallet: w } = await import('$lib/state/wallet/wallet.svelte');
		wallet = w;
	});

	// Reactive effect to initialize mint when env is loaded
	$effect(() => {
		if (wallet && env.settings?.OPENPLEB_MINT_URL) {
			console.log('init mint');
			wallet.initMint(env.settings.OPENPLEB_MINT_URL).catch((error) => {
				const err = ensureError(error);
				console.error('Failed to initialize mint:', err);
				toast.error(`Mint init failed: ${err.message}`);
			});
		}
	});

	let isOpen = $state(true);

	// Format balance with thousands separator
	function formatBalance(balance: number): string {
		return balance.toLocaleString();
	}
</script>

<Sheet.Root bind:open={isOpen}>
	<div class="fixed bottom-4 left-4 z-50">
		<Sheet.Trigger disabled={!wallet}>
			<Button
				size="icon-lg"
				class="relative h-14 w-14 rounded-full shadow-lg transition-shadow hover:shadow-xl"
				aria-label="Open wallet"
			>
				{#if wallet}
					<Wallet class="h-6 w-6" />
					{#if wallet.balance > 0}
						<Badge
							variant="secondary"
							class="absolute -top-1 -right-1 min-w-[2rem] justify-center px-1.5 py-0.5 text-xs font-semibold"
						>
							{formatBalance(wallet.balance)}
						</Badge>
					{/if}
				{:else}
					<LoaderCircle class="animate-spin"></LoaderCircle>
				{/if}
			</Button>
		</Sheet.Trigger>
	</div>

	<Sheet.Content side="left" class="w-[400px] sm:w-[540px]">
		<Sheet.Header>
			<Sheet.Title>Wallet</Sheet.Title>
			<Sheet.Description></Sheet.Description>
		</Sheet.Header>
		{#if wallet}
			<div class="space-y-6 p-2">
				{#if view === 'balance'}
					<!-- Balance Display -->
					<div
						class="flex items-center justify-center gap-2 rounded-lg border bg-card p-6 text-center"
					>
						<Landmark class="w-4 text-muted-foreground"></Landmark>
						{#if wallet.mint}
							<p class="text-sm text-muted-foreground">
								{wallet.mint.mintUrl}
							</p>
						{:else}
							<LoaderCircle class="w-4 animate-spin text-muted-foreground" />
						{/if}
					</div>

					<div class="rounded-lg border bg-card p-6 text-center">
						<p class="mb-2 text-sm text-muted-foreground">Balance</p>
						<p class="text-4xl font-bold">{formatBalance(wallet.balance)}</p>
						<p class="mt-1 text-sm text-muted-foreground">sats</p>
					</div>

					<!-- Wallet Actions Placeholder -->
					<div class="flex gap-2">
						<Button
							size="lg"
							variant="outline"
							class="grow"
							onclick={() => {
								view = 'receive';
							}}
						>
							<Download></Download> Receive
						</Button>
						<Button
							size="lg"
							onclick={() => {
								view = 'receive';
							}}
						>
							<ScanQrCode></ScanQrCode>
						</Button>
						<Button
							size="lg"
							variant="outline"
							class="grow"
							onclick={() => {
								view = 'receive';
							}}
						>
							<Upload></Upload> Send
						</Button>
					</div>
					<!-- History Section -->
					<div class="space-y-2">
						<p class="text-center font-bold">History</p>
						{#if wallet.history.length === 0}
							<p class="text-center text-sm text-muted-foreground py-4">No transactions yet</p>
						{:else}
							<div class="space-y-2">
								{#each wallet.history as item, index (index)}
									<div class="rounded-lg border bg-card p-3 hover:bg-accent/50 transition-colors">
										<div class="flex items-center justify-between">
											<div class="flex items-center gap-2">
												{#if item.type === 'mint' || item.type === 'receive'}
													<Download class="h-4 w-4 text-green-500" />
												{:else if item.type === 'melt'}
													<Upload class="h-4 w-4 text-red-500" />
												{:else if item.type === 'send'}
													<Upload class="h-4 w-4 text-blue-500" />
												{/if}
												<div>
													<p class="text-sm font-medium capitalize">{item.type}</p>
													<p class="text-xs text-muted-foreground">
														{new Date(item.createdAt).toLocaleString()}
													</p>
												</div>
											</div>
											<div class="text-right">
												<p class="text-sm font-semibold">
													{#if item.type === 'mint' || item.type === 'receive'}
														<span class="text-green-500">+{formatBalance(item.amount)}</span>
													{:else}
														<span class="text-red-500">-{formatBalance(item.amount)}</span>
													{/if}
												</p>
												<p class="text-xs text-muted-foreground">{item.unit || 'sat'}</p>
											</div>
										</div>
										{#if 'state' in item && item.state}
											<div class="mt-2">
												<Badge variant={item.state === 'PAID' || item.state === 'finalized' ? 'default' : 'secondary'} class="text-xs">
													{item.state}
												</Badge>
											</div>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{:else if view === 'receive'}
					<div>
						<ReceiveView {wallet} onBack={()=> {view="balance"}}></ReceiveView>
					</div>
				{:else if view === 'send'}{:else if view === 'scan'}{/if}
			</div>
		{/if}
	</Sheet.Content>
</Sheet.Root>
