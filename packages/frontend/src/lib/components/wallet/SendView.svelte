<script lang="ts">
	import { Upload, Zap, ArrowLeft, ScanLine } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import type { CocoWallet } from '$lib/state/wallet/wallet.svelte';
	import { toast } from 'svelte-sonner';
	import { ensureError } from 'common/errors';
	import type {  MeltHistoryEntry, SendHistoryEntry } from 'coco-cashu-core';
	import { isLightningInvoice, parseInvoice } from '$lib/utils/invoice';
	import { validateLnAddress, getInvoiceForLNURLAddress } from 'common/lnurl';
	import { delay } from 'common/util';
	import { onMount } from 'svelte';
	import { lastScan } from '$lib/state/cache/lastScan.svelte';
	import { walletView } from '$lib/state/walletView.svelte';

	interface Props {
		wallet: CocoWallet;
		onBack: () => void;
		onSend: (historyItem: SendHistoryEntry) => void;
		onMelt: (historyItem: MeltHistoryEntry) => void;
	}

	onMount(() => {
		if (lastScan.scan) {
			const scanned = lastScan.scan.trim();
			// Check if it's a lightning invoice or LNURL address
			if (scanned.startsWith('lnbc') || scanned.includes('@')) {
				lightningInput = scanned;
				handleLightningInput();
				// Clear the scan after using it
				lastScan.scan = '';
			}
		}
	});

	let { wallet, onBack, onSend, onMelt }: Props = $props();

	let lightningInput = $state('');
	let amount = $state('');
	let isLoading = $state(false);
	let detectedType: 'invoice' | 'address' | null = $state(null);
	let detectedAmount: number | null = $state(null);

	// Format balance with thousands separator
	function formatBalance(balance: number): string {
		return balance.toLocaleString();
	}

	// Handle Lightning input changes
	function handleLightningInput() {
		const trimmed = lightningInput.trim();
		
		if (!trimmed) {
			detectedType = null;
			detectedAmount = null;
			return;
		}

		// Check if it's a Lightning invoice
		else if (isLightningInvoice(trimmed)) {
			detectedType = 'invoice';
			const invoiceData = parseInvoice(trimmed);
			detectedAmount = invoiceData?.amount || null;
			amount = ""+detectedAmount
			return;
		}

		// Check if it's a Lightning address
		else if (validateLnAddress(trimmed)) {
			detectedType = 'address';
			detectedAmount = null; // Lightning address requires user to enter amount
			return;
		}

		// Not recognized
		detectedType = null;
		detectedAmount = null;
	}
	// Handle amount input - only allow numbers
	function handleAmountInput(e: Event) {
		const input = e.target as HTMLInputElement;
		const value = input.value.replace(/[^0-9]/g, '');
		amount = value;
	}

	async function handleSendEcash() {
		const amountNum = parseInt(amount);
		
		if (!amountNum || amountNum <= 0) {
			toast.error('Please enter a valid amount');
			return;
		}

		if (amountNum > wallet.balance) {
			toast.error('Insufficient balance');
			return;
		}

		isLoading = true;
		try {
			await wallet.sendEcash(amountNum);
			toast.success('Ecash token created successfully!');
			setTimeout(() => {
				const historyItem = wallet.history.find(h => h.type === "send");
				if (historyItem) onSend(historyItem);
			}, 100);
		} catch (error) {
			const err = ensureError(error);
			console.error('Failed to send ecash:', err);
			toast.error(`Failed to send: ${err.message}`);
		} finally {
			isLoading = false;
		}
	}

	async function handleSendLightning() {
		const invoice = lightningInput.trim();
		
		if (!invoice) {
			toast.error('Please enter a Lightning invoice');
			return;
		}

		// If invoice has an amount, use it; otherwise require manual amount entry
		const amountNum = detectedAmount || parseInt(amount);
		
		if (!amountNum || amountNum <= 0) {
			toast.error('Please enter a valid amount');
			return;
		}

		if (amountNum > wallet.balance) {
			toast.error('Insufficient balance');
			return;
		}

		isLoading = true;
		try {
			await wallet.sendLn(invoice);
			toast.success('Lightning payment sent successfully!');
			await wallet.waitForHistoryUpdate();
			const historyItem = wallet.history.find(h => h.type === "melt");
			if (historyItem) onMelt(historyItem);
		} catch (error) {
			const err = ensureError(error);
			console.error('Failed to send Lightning payment:', err);
			toast.error(`Failed to send: ${err.message}`);
		} finally {
			isLoading = false;
		}
	}

	async function handleSendLnurl() {
		const lnAddress = lightningInput.trim();
		const amountNum = parseInt(amount);
		
		if (!lnAddress) {
			toast.error('Please enter a Lightning address');
			return;
		}

		if (!amountNum || amountNum <= 0) {
			toast.error('Please enter a valid amount');
			return;
		}

		if (amountNum > wallet.balance) {
			toast.error('Insufficient balance');
			return;
		}

		isLoading = true;
		try {
			// Get invoice from Lightning address
			const invoice = await getInvoiceForLNURLAddress(amountNum, lnAddress);
			
			// Pay the invoice
			const result = await wallet.sendLn(invoice);
			await wallet.waitForHistoryUpdate();
			await delay(100)
			const historyItem = wallet.history.find(h => h.id === result.id);
			if (historyItem) onMelt(historyItem);
			toast.success('Lightning payment sent successfully!');
		} catch (error) {
			const err = ensureError(error);
			console.error('Failed to send Lightning payment:', err);
			toast.error(`Failed to send: ${err.message}`);
		} finally {
			isLoading = false;
		}
	}

	async function handleSend() {
		if (detectedType === 'invoice') {
			await handleSendLightning();
		} else if (detectedType === 'address') {
			await handleSendLnurl();
		} else {
			await handleSendEcash();
		}
	}



	// Get button text based on mode
	const buttonText = $derived(() => {
		if (isLoading) {
			return detectedType ? 'Sending Payment...' : 'Creating Token...';
		}
		
		if (detectedType === 'invoice') {
			return 'Pay Lightning Invoice';
		} else if (detectedType === 'address') {
			return 'Pay Lightning Address';
		} else {
			return 'Generate Ecash Token';
		}
	});

	// Get button icon based on mode
	const ButtonIcon = $derived(detectedType ? Zap : Upload);
</script>

<div class="space-y-6">
	<!-- Back Button -->
	<Button variant="ghost" size="sm" onclick={onBack}>
		<ArrowLeft class="h-4 w-4 mr-1" />
		Back
	</Button>
	<div class="rounded-lg flex items-center justify-between">
	<p class="font-bold text-xl">
		Send
	</p>
	<!-- Balance Display -->
	 <div class="rounded-lg flex flex-col  p-2 gap-1 bg-card border">
		
		<p class="text-xs text-muted-foreground">available</p>
		<div class="flex gap-1 items-end">
			<p class="text-2xl font-bold">{formatBalance(wallet.balance)}</p>
			<p class="text-sm text-muted-foreground">sats</p>
		</div>
	</div>
	</div>

	<!-- Lightning Invoice/Address Input -->
	<div class="rounded-lg border bg-card p-4">
		<Label for="lightning-input" class="text-sm font-medium mb-2 block">
			Lightning Invoice or Address
		</Label>
		<div class="relative">
			<Input
				id="lightning-input"
				type="text"
				placeholder="lnbc... or user@domain.com"
				bind:value={lightningInput}
				oninput={handleLightningInput}
				class="font-mono text-sm pr-10"
				disabled={isLoading}
			/>
			<button
				type="button"
				onclick={() => walletView.setView('scan')}
				class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-accent transition-colors"
				disabled={isLoading}
				aria-label="Scan QR code"
			>
				<ScanLine class="h-4 w-4 text-muted-foreground" />
			</button>
		</div>
	</div>



	{#if !detectedType}
	
	<!-- Divider -->
	<div class="relative mb-6">
		<div class="absolute inset-0 flex items-center">
			<span class="w-full border-t"></span>
		</div>
		<div class="relative flex justify-center text-xs uppercase">
			<span class="bg-background px-2 text-muted-foreground">Or</span>
		</div>
	</div>
	{/if}

	<!-- Amount Display (if detected from invoice) -->
	{#if detectedAmount}
		<div class="rounded-lg border bg-card p-4">
			<p class="text-sm text-muted-foreground mb-1">Invoice Amount</p>
			<p class="text-2xl font-bold">{formatBalance(detectedAmount)} sats</p>
		</div>
	{/if}
	<!-- Amount Input (conditional) -->
	{#if !detectedAmount}
		<div class="rounded-lg p-4 flex flex-col justify-center items-center">
			<div class="flex items-baseline gap-2">
				<input
					id="amount"
					type="text"
					placeholder="0"
					min="1"
					max={wallet.balance}
				inputmode="numeric"
				value={amount}
				oninput={handleAmountInput}
				class="w-full border-0 bg-transparent text-center text-6xl font-bold outline-none ring-0 focus:ring-0 focus-visible:ring-0"
				style="min-width: 200px;"
					disabled={isLoading}
				/>
			</div>
			<span class="text-sm text-muted-foreground whitespace-nowrap text-center ">sats</span>
		</div>
	{/if}

	<!-- Send Button -->
	<Button
		size="lg"
		class="w-full"
		variant={buttonText()==="Generate Ecash Token" || buttonText()==="Creating Token..."?'secondary':'default'}
		onclick={handleSend}
		disabled={isLoading || (!amount || parseInt(amount) <= 0)}
	>
		{#if isLoading}
			<span class="animate-spin mr-2">⏳</span>
		{:else}
			<svelte:component this={ButtonIcon} class="mr-2 h-4 w-4" />
		{/if}
		{buttonText()}
	</Button>

</div>
