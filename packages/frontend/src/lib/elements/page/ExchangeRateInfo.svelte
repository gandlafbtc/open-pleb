<script lang="ts">
	import { env } from "$lib/state/dynamic/env.svelte";
	import { exchangeRate } from "$lib/state/dynamic/exchangerate.svelte";
	import { Card } from "$lib/components/ui/card";
	import * as Accordion from "$lib/components/ui/accordion";
	import { Info, TrendingUp } from "@lucide/svelte";

	// Track accordion state
	let accordionValue = $state<string | undefined>(undefined);

	// Calculate fees (excluding bonds)
	let totalFeePercentage = $derived.by(() => {
		if (!env.settings) return 0;
		return (
			env.settings.OPENPLEB_PLATFORM_FEE_PERCENTAGE +
			env.settings.OPENPLEB_TAKER_FEE_PERCENTAGE
		);
	});

	let totalFlatFee = $derived.by(() => {
		if (!env.settings) return 0;
		return (
			env.settings.OPENPLEB_PLATFORM_FEE_FLAT_RATE +
			env.settings.OPENPLEB_TAKER_FEE_FLAT_RATE
		);
	});

	// Calculate bonds separately
	let totalBondPercentage = $derived.by(() => {
		if (!env.settings) return 0;
		return env.settings.OPENPLEB_BOND_PERCENTAGE;
	});

	let totalBondFlat = $derived.by(() => {
		if (!env.settings) return 0;
		return env.settings.OPENPLEB_BOND_FLAT_RATE;
	});
</script>

<Card class="p-3">
	<div class="flex items-center gap-2 mb-1">
		<TrendingUp class="w-4 h-4 text-primary" />
		<div>
			<h3 class="text-sm font-semibold">Exchange Rate</h3>
			{#if exchangeRate.rate}
				<p class="text-lg font-bold text-primary">
					{exchangeRate.rate.toLocaleString()} {env.settings?.OPENPLEB_CURRENCY || 'USD'}/BTC
				</p>
			{:else}
				<p class="text-xs text-muted-foreground">Loading...</p>
			{/if}
		</div>
	</div>

	<Accordion.Root type="single" class="w-full" bind:value={accordionValue}>
		<Accordion.Item value="fees">
			<Accordion.Trigger class="text-sm">
				<div class="flex gap-1 flex-col items-start w-full">
					<div class="flex items-center gap-2">
						<span class="w-16">Fees</span>
						<span class="font-semibold">
							{totalFeePercentage}% + {totalFlatFee} sats
						</span>
					</div>
					<div class="flex items-center gap-2 text-xs text-muted-foreground">
						<span class="w-16">Bonds</span>
						<span class="font-medium">
							{totalBondPercentage}% + {totalBondFlat} sats
						</span>
					</div>
				</div>

				{#if accordionValue !== "fees"}
					<div class="flex gap-1 items-center right-0 bottom-1 text-xs text-muted-foreground absolute">
						<p>
							Click for more info
						</p>
						<Info class="w-3"></Info>
					</div>
				{/if}
			</Accordion.Trigger>
			<Accordion.Content>
				<div class="space-y-1 pt-1">
					{#if env.settings}
						<div class="flex justify-between text-xs">
							<span class="text-muted-foreground">Platform Fee:</span>
							<span class="font-medium">
								{env.settings.OPENPLEB_PLATFORM_FEE_PERCENTAGE}% + {env.settings.OPENPLEB_PLATFORM_FEE_FLAT_RATE} sats
							</span>
						</div>
						<div class="flex justify-between text-xs">
							<span class="text-muted-foreground">Taker Fee:</span>
							<span class="font-medium">
								{env.settings.OPENPLEB_TAKER_FEE_PERCENTAGE}% + {env.settings.OPENPLEB_TAKER_FEE_FLAT_RATE} sats
							</span>
						</div>
						<div class="flex justify-between text-xs">
							<span class="text-muted-foreground">Bond:</span>
							<span class="font-medium">
								{env.settings.OPENPLEB_BOND_PERCENTAGE}% + {env.settings.OPENPLEB_BOND_FLAT_RATE} sats
							</span>
						</div>
						<div class="border-t pt-1 mt-1">
							<div class="flex justify-between text-xs font-semibold">
								<span>Total:</span>
								<span class="text-primary">
									{totalFeePercentage + totalBondPercentage}% + {totalFlatFee + totalBondFlat} sats
								</span>
							</div>
						</div>
					{:else}
						<p class="text-xs text-muted-foreground">Loading fee information...</p>
					{/if}
				</div>
			</Accordion.Content>
		</Accordion.Item>
	</Accordion.Root>
</Card>
