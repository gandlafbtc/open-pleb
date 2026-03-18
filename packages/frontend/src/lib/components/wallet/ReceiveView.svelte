<script lang="ts">
	import { ArrowLeft, Copy, QrCode } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { CocoWallet } from '$lib/state/wallet/wallet.svelte';
	import { copyTextToClipboard } from '$lib/utils';
	import encodeQR from 'qr';

	interface Props {
		wallet: CocoWallet;
		onBack: () => void;
	}

	let { wallet, onBack }: Props = $props();

	let amount = $state('');
	let invoice = $state<string | null>(null);
	let isGenerating = $state(false);

	// Handle amount input - only allow numbers
	function handleAmountInput(e: Event) {
		const input = e.target as HTMLInputElement;
		const value = input.value.replace(/[^0-9]/g, '');
		amount = value;
	}

	async function createInvoice() {
		if (!amount || parseInt(amount) <= 0) return;

		isGenerating = true;
		try {
			const mintQuote = await wallet.receiveLn(parseInt(amount));
			invoice = mintQuote.request;
		} catch (error) {
			console.error('Failed to generate receive token:', error);
		} finally {
			isGenerating = false;
		}
	}

</script>

<div class="flex h-full flex-col">
	<!-- Header -->
	<div class="mb-6 flex items-center gap-3">
		<Button variant="ghost" size="icon" onclick={onBack}>
			<ArrowLeft class="h-5 w-5" />
		</Button>
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

	<!-- Token Display -->
	{#if invoice}
		<div class="rounded-lg border bg-card p-4">
			<div class="mb-2 flex items-center justify-between">
				<p class="text-sm font-medium">Lightning Invoice</p>
				<Button variant="ghost" size="sm" onclick={()=> {
                    copyTextToClipboard(invoice??'', "invoice")
                }}>
					<Copy class="h-4 w-4" />
				</Button>
			</div>
			<div class="break-all rounded bg-muted p-3 text-xs font-mono">
				{invoice}
                <div class="bg-white rounded-md">
                {@html 
                    encodeQR(invoice, "svg")
                }
                </div>
			</div>
		</div>
	{/if}
</div>
