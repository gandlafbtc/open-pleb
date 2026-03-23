<script lang="ts">
	import { ArrowLeft, Download, Landmark, LoaderCircle, ScanQrCode, Upload, Wallet } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import * as Sheet from '$lib/components/ui/sheet';
	import { onMount } from 'svelte';
	import type { CocoWallet } from '$lib/state/wallet/wallet.svelte';
	import { env } from '$lib/state/dynamic/env.svelte';
	import { toast } from 'svelte-sonner';
	import { ensureError } from 'common/errors';
	import ReceiveView from './ReceiveView.svelte';
	import SendView from './SendView.svelte';
	import HistoryDetailView from './HistoryDetailView.svelte';
	import type { HistoryEntry } from 'coco-cashu-core';
	import Scanner from '$lib/elements/qr/Scanner.svelte';
	import { walletView } from '$lib/state/walletView.svelte';

	let wallet: CocoWallet | undefined = $state(undefined);

	let historyDisplayCount = $state(5);

	// Derive the actual history item from wallet history (reactive!)
	const selectedHistoryItem = $derived.by(() => {
		if (!walletView.selectedHistoryId || !wallet) return undefined;
		return wallet.history.find((h) => h.id === walletView.selectedHistoryId);
	});

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

	// Format balance with thousands separator
	function formatBalance(balance: number): string {
		return balance.toLocaleString();
	}

	function handleHistoryItemClick(item: HistoryEntry) {
		walletView.selectHistory(item);
	}

	function loadMoreHistory() {
		historyDisplayCount += 5;
	}

	const displayedHistory = $derived.by(() => {
		if (!wallet) return [];
		return wallet.history.slice(0, historyDisplayCount);
	});

	const hasMoreHistory = $derived.by(() => {
		if (!wallet) return false;
		return wallet.history.length > historyDisplayCount;
	});
</script>

<Sheet.Root bind:open={walletView.isOpen}>
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
				{#if walletView.view === 'balance'}
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
								walletView.setView('receive');
							}}
						>
							<Download></Download> Receive
						</Button>
						<Button
							size="lg"
							onclick={() => {
								walletView.setView('scan');
							}}
						>
							<ScanQrCode
								
							></ScanQrCode>
						</Button>
						<Button
							size="lg"
							variant="outline"
							class="grow"
							onclick={() => {
								walletView.setView('send');
							}}
						>
							<Upload></Upload> Send
						</Button>
					</div>
					<!-- History Section -->
					<div class="space-y-2">
						<p class="text-center font-bold">History</p>
						{#if wallet.history.length === 0}
							<p class="py-4 text-center text-sm text-muted-foreground">No transactions yet</p>
						{:else}
							<div class="max-h-[400px] space-y-2 overflow-y-auto pr-1">
								{#each displayedHistory as item, index (index)}
									<button
										class="w-full cursor-pointer rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent/50"
										onclick={() => handleHistoryItemClick(item)}
									>
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
													<p class="text-xs text-muted-foreground">
														{new Date(item.createdAt).toLocaleString()}
													</p>
												</div>
												{#if 'state' in item && item.state}
													<div>
														<Badge
															variant={item.state === 'ISSUED' || item.state === 'finalized'
																? 'default'
																: 'secondary'}
															class="text-xs"
														>
															{item.state}
														</Badge>
													</div>
												{/if}

												{#if item.type==="receive"}
													<div>
														<Badge
															variant='default'
															class="text-xs"
														>
															finalized
														</Badge>
													</div>
												{/if}
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
									</button>
								{/each}
							</div>
							{#if hasMoreHistory}
								<div class="pt-2">
									<Button variant="outline" size="sm" class="w-full" onclick={loadMoreHistory}>
										Load More ({wallet.history.length - historyDisplayCount})
									</Button>
								</div>
							{/if}
						{/if}
					</div>
				{:else if walletView.view === 'receive'}
					<div>
						<ReceiveView
							{wallet}
							onBack={() => {
								walletView.goToBalance();
							}}
							onInvoice={(historyItem) => {
								console.log(historyItem);
								walletView.selectHistory(historyItem);
							}}
							onReceive={(historyItem) => {
								console.log(historyItem);
								walletView.selectHistory(historyItem);
							}}
						></ReceiveView>
					</div>
				{:else if walletView.view === 'send'}
					<div>
						<SendView
							{wallet}
							onBack={() => {
								walletView.goToBalance();
							}}
							onSend={(historyItem) => {
								console.log(historyItem);
								walletView.selectHistory(historyItem);
							}}
							onMelt={(historyItem) => {
								console.log(historyItem);
								walletView.selectHistory(historyItem);
							}}
						></SendView>
					</div>
				{:else if walletView.view === 'history-detail'}
					{#if selectedHistoryItem}
						<div class="h-full">
							<HistoryDetailView
								item={selectedHistoryItem}
								onBack={() => {
									walletView.goToBalance();
								}}
							/>
						</div>
					{/if}
				{:else if walletView.view === 'scan'}
										<!-- Back Button -->
				<div class="mb-2">
					<Button variant="ghost" size="sm" onclick={()=> walletView.goToBalance()}>
						<ArrowLeft class="h-4 w-4 mr-1" />
						Back
					</Button>
				</div>
				<Scanner/>
				{/if}
			</div>
		{/if}
	</Sheet.Content>
</Sheet.Root>
