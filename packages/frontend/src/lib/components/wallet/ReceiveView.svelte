<script lang="ts">
	import { ArrowLeft, QrCode, Download } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { CocoWallet } from '$lib/state/wallet/wallet.svelte';
	import type { HistoryEntry } from 'coco-cashu-core';

	interface Props {
		wallet: CocoWallet;
		onBack: () => void;
		onInvoice: (historyItem: HistoryEntry)=> void;
	}

	let { wallet, onBack, onInvoice }: Props = $props();

	let amount = $state('');
	let tokenInput = $state('');
	let invoice = $state<string | null>(null);
	let isGenerating = $state(false);
	let isRedeeming = $state(false);
	let error = $state<string | null>(null);

	// Handle amount input - only allow numbers
	function handleAmountInput(e: Event) {
		const input = e.target as HTMLInputElement;
		const value = input.value.replace(/[^0-9]/g, '');
		amount = value;
		error = null;
	}

	function handleTokenInput(e: Event) {
		const input = e.target as HTMLTextAreaElement;
		tokenInput = input.value.trim();
		error = null;
	}

	async function createInvoice() {
		if (!amount || parseInt(amount) <= 0) return;

		isGenerating = true;
		error = null;
		try {
			const mintQuote = await wallet.receiveLn(parseInt(amount));
			console.log(mintQuote)
			setTimeout(()=> {
				const historyItem = wallet.history.find(h=>h.quoteId===mintQuote.quote)
				onInvoice(historyItem!)
			},100)
		} catch (err) {
			console.error('Failed to generate receive token:', err);
			error = 'Failed to create invoice. Please try again.';
		} finally {
			isGenerating = false;
		}
	}

	async function redeemToken() {
		if (!tokenInput) return;

		isRedeeming = true;
		error = null;
		try {
			await wallet.receiveEcash(tokenInput);
			// Wait a bit for history to update
			setTimeout(() => {
				// Find the most recent receive history entry
				const historyItem = wallet.history.find(h => h.type === 'receive');
				if (historyItem) {
					onInvoice(historyItem);
				}
			}, 100);
		} catch (err) {
			console.error('Failed to redeem token:', err);
			error = 'Failed to redeem token. Please check the token and try again.';
		} finally {
			isRedeeming = false;
		}
	}

</script>

<div class="flex h-full flex-col">
	<!-- Back Button -->
	<div class="mb-2">
		<Button variant="ghost" size="sm" onclick={onBack}>
			<ArrowLeft class="h-4 w-4 mr-1" />
			Back
		</Button>
	</div>

	<!-- Header -->
	<div class="mb-6">
		<h2 class="text-xl font-semibold">Receive</h2>
	</div>

	<!-- Amount Input Section -->
	<div class="mb-8 flex flex-col items-center justify-center space-y-2">
		<label for="amount" class="text-sm text-muted-foreground">Amount</label>
		<div class="relative flex items-center">
			<input
				id="amount"
				type="text"
				inputmode="numeric"
				value={amount}
				oninput={handleAmountInput}
				placeholder="0"
				class="w-full border-0 bg-transparent text-center text-6xl font-bold outline-none ring-0 focus:ring-0 focus-visible:ring-0"
				style="min-width: 200px;"
			/>
		</div>
		<p class="text-sm text-muted-foreground">sats</p>
	</div>

	<!-- Generate Button -->
	<div class="mb-6">
		<Button
			onclick={createInvoice}
			disabled={!amount || parseInt(amount) <= 0 || isGenerating}
			class="w-full"
			size="lg"
		>
			{#if isGenerating}
				Creating Invoice...
			{:else}
				<QrCode class="mr-2 h-5 w-5" />
				Create Invoice
			{/if}
		</Button>
	</div>

	<!-- Divider -->
	<div class="relative mb-6">
		<div class="absolute inset-0 flex items-center">
			<span class="w-full border-t"></span>
		</div>
		<div class="relative flex justify-center text-xs uppercase">
			<span class="bg-background px-2 text-muted-foreground">Or</span>
		</div>
	</div>

	<!-- Token Input Section -->
	<div class="mb-4">
		<label for="token" class="mb-2 block text-sm font-medium">Paste Ecash Token</label>
		<textarea
			id="token"
			value={tokenInput}
			oninput={handleTokenInput}
			placeholder="cashuA..."
			rows="3"
			class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
		></textarea>
	</div>

	<!-- Redeem Button -->
	<div class="mb-4">
		<Button
			onclick={redeemToken}
			disabled={!tokenInput || isRedeeming}
			class="w-full"
			size="lg"
			variant="secondary"
		>
			{#if isRedeeming}
				Redeeming...
			{:else}
				<Download class="mr-2 h-5 w-5" />
				Redeem Token
			{/if}
		</Button>
	</div>

	<!-- Error Message -->
	{#if error}
		<div class="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
			{error}
		</div>
	{/if}

</div>
