<script lang="ts">
	import { blindSessionState } from '$lib/state/dynamic/blindSession.svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import * as Select from '$lib/components/ui/select';
	import SessionCreator from '$lib/elements/session/SessionCreator.svelte';
	import OfferPreview from '$lib/elements/offer/OfferPreview.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { env } from '$lib/state/dynamic/env.svelte';
	import { providerStore } from '$lib/state/persistent/db/repos/provider';

	interface Props {
		showPreview?: boolean;
	}

	let { showPreview = $bindable(false) }: Props = $props();

	let fiatAmountCents = $state<string>(''); // Store as smallest unit (cents/pennies/etc)
	let fiatAddress = $state('');
	let fiatProviderId = $state<string>('');
	let description = $state('');
	let activeTab = $state<string>('scan');

	

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

	function handlePreview() {
		// Validate before showing preview
		const amountCents = parseInt(fiatAmountCents);
		if (!amountCents || amountCents <= 0) {
			toast.error('Fiat amount must be greater than 0');
			return;
		}

		if (!fiatAddress.trim()) {
			toast.error('Fiat address is required');
			return;
		}

		showPreview = true;
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
{:else if showPreview}
	<div class="max-w-2xl mx-auto">
		<OfferPreview
			fiatAmountCents={fiatAmountCents}
			fiatAddress={fiatAddress}
			fiatProviderId={fiatProviderId}
			description={description}
			sessionId={sessionId || ''}
			onBack={() => showPreview = false}
		/>
	</div>
{:else}
	<div class="max-w-2xl mx-auto ">
		<div class="my-6">
			<h1 class="text-2xl font-bold">Create New Offer</h1>
		</div>

		<Card>
			<CardContent>
				<Tabs bind:value={activeTab}>
					<TabsList class="grid w-full grid-cols-2">
						<TabsTrigger value="scan">Scan</TabsTrigger>
						<TabsTrigger value="input">Input</TabsTrigger>
					</TabsList>
					
					<TabsContent value="scan" class="mt-6">
						<div class="flex flex-col items-center justify-center py-12 text-center">
							<p class="text-muted-foreground">QR Scanner coming soon...</p>
						</div>
					</TabsContent>
					
					<TabsContent value="input" class="mt-6">
						<form onsubmit={(e) => { e.preventDefault(); handlePreview(); }} class="space-y-6">
							<!-- Fiat Amount Input (styled like SendView) -->
							<div class="">
								<div class="rounded-lg border bg-card p-2 flex flex-col justify-center items-center">
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
								/>
							</div>

							<!-- Fiat Provider Dropdown -->
							<div class="space-y-2 flex gap-2 items-baseline">
								<Label for="provider" class="text-nowrap">Payment Provider</Label>
								<Select.Root type='single'  bind:value={fiatProviderId}>
									<Select.Trigger class="w-full">
										{#if fiatProviderId}
											{@const selectedProvider = providerStore.data.find(p => p.id.toString() === fiatProviderId)}
											{#if selectedProvider}
												<div class="flex items-center gap-2">
													{#if selectedProvider.icon}
														<img src={selectedProvider.icon} alt={selectedProvider.label} class="w-4 h-4" />
													{/if}
													{selectedProvider.label}
												</div>
											{:else}
												<span class="text-muted-foreground">Select payment provider (optional)</span>
											{/if}
										{:else}
											<span class="text-muted-foreground">Select payment provider (optional)</span>
										{/if}
									</Select.Trigger>
									<Select.Content>
										{#each providerStore.data as provider (provider.id)}
											<Select.Item value={provider.id.toString()} label={provider.label}>
												<div class="flex items-center gap-2">
													{#if provider.icon}
														<img src={provider.icon} alt={provider.label} class="w-4 h-4" />
													{/if}
													{provider.label}
												</div>
											</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</div>



							<!-- Description -->
							<div class="space-y-2">
								<Label for="description">Description (Optional)</Label>
								<Textarea
									id="description"
									bind:value={description}
									placeholder="Add any additional details about your offer"
									rows={3}
								/>
							</div>

							<!-- Action Buttons -->
							<div class="flex gap-3 justify-end">
								<Button type="button" variant="outline" onclick={handleCancel}>
									Cancel
								</Button>
								<Button type="submit" disabled={!fiatAmountCents || !fiatAddress.trim()}>
									Preview Offer
								</Button>
							</div>
						</form>
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	</div>
{/if}
