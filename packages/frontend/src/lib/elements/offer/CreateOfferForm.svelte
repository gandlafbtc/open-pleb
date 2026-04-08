<script lang="ts">
	import { blindSessionState } from '$lib/state/dynamic/blindSession.svelte';
	import { createOffer } from '$lib/interface/rest/offer.api';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import SessionCreator from '$lib/elements/session/SessionCreator.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { env } from '$lib/state/dynamic/env.svelte';

	let isLoading = $state(false);
	let fiatAmountCents = $state<string>(''); // Store as smallest unit (cents/pennies/etc)
	let fiatAddress = $state('');
	let fiatProviderId = $state<string>('');
	let description = $state('');

	// Mock fiat providers - will be fetched from backend later
	const fiatProviders = [
		{ value: '1', label: 'PayPal' },
		{ value: '2', label: 'Bank Transfer' },
		{ value: '3', label: 'Venmo' },
		{ value: '4', label: 'Cash App' },
		{ value: '5', label: 'Zelle' }
	];

	const { isActive, role, sessionId } = $derived({
		isActive: blindSessionState.isActive,
		role: blindSessionState.role,
		sessionId: blindSessionState.currentSession?.sessionId
	});

	const canCreateOffer = $derived(isActive && role === 'maker');

	// Determine if currency uses decimals (most do, except KRW, JPY, etc.)
	const currencyUsesDecimals = $derived.by(() => {
		const currency = env.settings?.OPENPLEB_CURRENCY || 'USD';
		const noDecimalCurrencies = ['KRW', 'JPY', 'VND', 'IDR'];
		return !noDecimalCurrencies.includes(currency);
	});

	// Format amount based on currency
	const displayAmount = $derived.by(() => {
		if (!fiatAmountCents) return '';
		const amount = parseInt(fiatAmountCents);
		if (isNaN(amount)) return '';
		
		if (currencyUsesDecimals) {
			// For currencies with decimals, divide by 100 (cents to dollars/euros)
			return (amount / 100).toFixed(2);
		} else {
			// For currencies without decimals (like KRW), display as-is
			return amount.toString();
		}
	});

	// Handle amount input - only allow integers
	function handleAmountInput(e: Event) {
		const input = e.target as HTMLInputElement;
		const value = input.value.replace(/[^0-9]/g, ''); // Only numbers
		fiatAmountCents = value;
	}

	async function handleSubmit() {
		if (!sessionId) {
			toast.error('No active session');
			return;
		}

		const amountCents = parseInt(fiatAmountCents);
		if (!amountCents || amountCents <= 0) {
			toast.error('Fiat amount must be greater than 0');
			return;
		}

		if (!fiatAddress.trim()) {
			toast.error('Fiat address is required');
			return;
		}

		isLoading = true;
		try {
			// Convert to currency unit based on whether it uses decimals
			const fiatAmount = currencyUsesDecimals ? amountCents / 100 : amountCents;
			
			const response = await createOffer({
				sessionId,
				fiatAmount,
				fiatProviderId: fiatProviderId ? parseInt(fiatProviderId) : null,
				fiatAddress: fiatAddress.trim(),
				description: description.trim() || undefined
			});

			if (response.success) {
				toast.success('Offer created successfully!');
				goto(resolve('/'));
			} else {
				toast.error(response.error || 'Failed to create offer');
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Failed to create offer';
			toast.error(errorMessage);
			console.error(error);
		} finally {
			isLoading = false;
		}
	}

	function handleCancel() {
		goto(resolve('/'))
	}
</script>

{#if !canCreateOffer}
	<div class="max-w-2xl mx-auto p-6">
		<div class="bg-secondary/10 border border-secondary/20 rounded-lg p-6 text-center">
			<p class="text-secondary font-medium mb-2">
				You need an active maker session to create an offer.
			</p>
			<p class="text-sm text-muted-foreground mb-4">
				Opening a session will consume 1 BAT from your wallet.
			</p>
			<SessionCreator 
				role="maker" 
				buttonText="Open Maker Session" 
				buttonVariant="secondary"
				buttonClass="w-full"
			/>
		</div>
	</div>
{:else}
	<div class="max-w-2xl mx-auto ">
		<div class="mb-6">
			<h1 class="text-2xl font-bold">Create New Offer</h1>
			<p class="text-muted-foreground mt-2">
				Fill in the details to create a new offer.
			</p>
		</div>

		<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-6">
			<!-- Fiat Amount Input (styled like SendView) -->
			<div class="space-y-2">
				<Label for="fiatAmount">Amount *</Label>
				<div class="rounded-lg border bg-card p-4 flex flex-col justify-center items-center">
					<div class="flex items-baseline gap-2">
						<input
							id="fiatAmount"
							type="text"
							placeholder="0"
							inputmode="numeric"
							value={fiatAmountCents}
							oninput={handleAmountInput}
							class="w-full border-0 bg-transparent text-center text-6xl font-bold outline-none ring-0 focus:ring-0 focus-visible:ring-0"
							style="min-width: 200px;"
							disabled={isLoading}
						/>
					</div>
					<div class="flex flex-col items-center gap-1">
						<span class="text-sm text-muted-foreground whitespace-nowrap text-center">
							{env.settings?.OPENPLEB_CURRENCY || 'USD'}
						</span>
						{#if displayAmount && currencyUsesDecimals}
							<span class="text-xs text-muted-foreground">
								≈ {displayAmount} {env.settings?.OPENPLEB_CURRENCY || 'USD'}
							</span>
						{/if}
					</div>
				</div>
			</div>
			<!-- Fiat Address -->
			<div class="space-y-2 flex gap-2 items-baseline">
				<Label for="fiatAddress" class="text-nowrap">Payment Address *</Label>
				<Input
					id="fiatAddress"
					type="text"
					bind:value={fiatAddress}
					placeholder="Enter payment address"
					required
					disabled={isLoading}
				/>
			</div>

			<!-- Fiat Provider Dropdown -->
			<div class="space-y-2 flex gap-2 items-baseline">
				<Label for="provider" class="text-nowrap">Method Provider</Label>
				<select
					id="provider"
					bind:value={fiatProviderId}
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					disabled={isLoading}
				>
					<option value="">Select payment method (optional)</option>
					{#each fiatProviders as provider (provider.value)}
						<option value={provider.value}>{provider.label}</option>
					{/each}
				</select>
			</div>



			<!-- Description -->
			<div class="space-y-2">
				<Label for="description">Description (Optional)</Label>
				<Textarea
					id="description"
					bind:value={description}
					placeholder="Add any additional details about your offer"
					disabled={isLoading}
					rows={3}
				/>
			</div>

			<!-- Action Buttons -->
			<div class="flex gap-3 justify-end">
				<Button type="button" variant="outline" onclick={handleCancel} disabled={isLoading}>
					Cancel
				</Button>
				<Button type="submit" disabled={isLoading || !fiatAmountCents || !fiatAddress.trim()}>
					{isLoading ? 'Creating...' : 'Create Offer'}
				</Button>
			</div>
		</form>
	</div>
{/if}
