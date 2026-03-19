<script lang="ts">
	import { Upload, Zap, ArrowLeft } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import type { CocoWallet } from '$lib/state/wallet/wallet.svelte';
	import { toast } from 'svelte-sonner';
	import { ensureError } from 'common/errors';
	import type { HistoryEntry } from 'coco-cashu-core';
	import { isLightningInvoice, parseInvoice } from '$lib/utils/invoice';
	import { validateLnAddress, getInvoiceForLNURLAddress } from 'common/lnurl';

	interface Props {
		wallet: CocoWallet;
		onBack: () => void;
		onSend: (historyItem: HistoryEntry) => void;
	}

	let { wallet, onBack, onSend }: Props = $props();

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
		if (isLightningInvoice(trimmed)) {
			detectedType = 'invoice';
			const invoiceData = parseInvoice(trimmed);
			detectedAmount = invoiceData?.amount || null;
			return;
		}

		// Check if it's a Lightning address
		if (validateLnAddress(trimmed)) {
			detectedType = 'address';
			detectedAmount = null; // Lightning address requires user to enter amount
			return;
		}

		// Not recognized
		detectedType = null;
		detectedAmount = null;
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
			const result = await wallet.sendEcash(amountNum);
			toast.success('Ecash token created successfully!');
			setTimeout(() => {
				const historyItem = wallet.history.find(h => h.id === result.id);
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
			const result = await wallet.sendLn(invoice);
			toast.success('Lightning payment sent successfully!');
			setTimeout(() => {
				const historyItem = wallet.history.find(h => h.operationId === result.operation.id);
				if (historyItem) onSend(historyItem);
			}, 100);
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
			toast.success('Lightning payment sent successfully!');
			setTimeout(() => {
				const historyItem = wallet.history.find(h => h.id === result.id);
				if (historyItem) onSend(historyItem);
			}, 100);
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

	// Determine if amount input should be shown
	const showAmountInput = $derived(
		!detectedType || 
		detectedType === 'address' || 
		(detectedType === 'invoice' && !detectedAmount)
	);

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
	<p class="font-bold text-xl">
		Send
	</p>
	<!-- Balance Display -->
	<div class="rounded-lg border bg-card p-2 text-center">
		<p class="mb-2 text-sm text-muted-foreground">Balance</p>
		<p class="text-4xl font-bold">{formatBalance(wallet.balance)}</p>
		<p class="mt-1 text-sm text-muted-foreground">sats</p>
	</div>

	<!-- Mode Indicator -->
	{#if detectedType}
		<div class="flex items-center justify-center gap-2 rounded-lg bg-primary/10 p-3 text-sm">
			<Zap class="h-4 w-4 text-primary" />
			<span class="text-primary font-medium">
				{detectedType === 'invoice' ? 'Lightning Invoice Detected' : 'Lightning Address Detected'}
			</span>
		</div>
	{/if}

	<!-- Lightning Invoice/Address Input -->
	<div class="rounded-lg border bg-card p-4">
		<Label for="lightning-input" class="text-sm font-medium mb-2 block">
			Lightning Invoice or Address (optional)
		</Label>
		<Input
			id="lightning-input"
			type="text"
			placeholder="lnbc... or user@domain.com"
			bind:value={lightningInput}
			oninput={handleLightningInput}
			class="font-mono text-sm"
			disabled={isLoading}
		/>
		{#if detectedType}
			<p class="text-xs text-muted-foreground mt-2">
				Detected: {detectedType === 'invoice' ? 'Lightning Invoice' : 'Lightning Address'}
			</p>
		{:else if lightningInput && !detectedType}
			<p class="text-xs text-destructive mt-2">
				Invalid Lightning invoice or address
			</p>
		{:else}
			<p class="text-xs text-muted-foreground mt-2">
				Leave empty to generate an ecash token
			</p>
		{/if}
	</div>

	<!-- Amount Display (if detected from invoice) -->
	{#if detectedAmount}
		<div class="rounded-lg border bg-card p-4">
			<p class="text-sm text-muted-foreground mb-1">Invoice Amount</p>
			<p class="text-2xl font-bold">{formatBalance(detectedAmount)} sats</p>
		</div>
	{/if}

	<!-- Amount Input (conditional) -->
	{#if showAmountInput}
		<div class="rounded-lg border bg-card p-4">
			<Label for="amount" class="text-sm font-medium mb-2 block">Amount</Label>
			<div class="flex items-baseline gap-2">
				<Input
					id="amount"
					type="number"
					placeholder="0"
					bind:value={amount}
					min="1"
					max={wallet.balance}
					class="text-2xl font-bold text-center flex-1"
					disabled={isLoading}
				/>
				<span class="text-sm text-muted-foreground whitespace-nowrap">sats</span>
			</div>
		</div>
	{/if}

	<!-- Send Button -->
	<Button
		size="lg"
		class="w-full"
		onclick={handleSend}
		disabled={isLoading || (showAmountInput && (!amount || parseInt(amount) <= 0))}
	>
		{#if isLoading}
			<span class="animate-spin mr-2">⏳</span>
		{:else}
			<svelte:component this={ButtonIcon} class="mr-2 h-4 w-4" />
		{/if}
		{buttonText()}
	</Button>

	<!-- Info Text -->
	<div class="rounded-lg bg-muted p-3 text-sm text-muted-foreground text-center">
		{#if detectedType === 'invoice'}
			<p>Pay a Lightning invoice directly from your ecash balance</p>
		{:else if detectedType === 'address'}
			<p>Send to a Lightning address (user@domain.com)</p>
		{:else}
			<p>Generate an ecash token to share with others</p>
		{/if}
	</div>
</div>
