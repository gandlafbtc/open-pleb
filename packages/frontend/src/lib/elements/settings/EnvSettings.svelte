<script lang="ts">
	import { env } from "$lib/state/dynamic/env.svelte";

	const formatPercentage = (value: number) => `${value}%`;
	const formatSats = (value: number) => `${value} sats`;
</script>

{#if env.settings}
	<div class="rounded-xl border border-border p-3">
		<div class="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
			<!-- Environment Mode -->
			<div class="flex justify-between items-center col-span-2 pb-1 border-b border-border/50">
				<span class="text-muted-foreground">Environment</span>
				<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold {env.settings.OPENPLEB_ENV === 'prod' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}">
					{env.settings.OPENPLEB_ENV.toUpperCase()}
				</span>
			</div>

			<!-- Currency -->
			<span class="text-muted-foreground">Currency</span>
			<span class="text-right">{env.settings.OPENPLEB_CURRENCY}</span>

			<!-- Max Fiat Amount -->
			<span class="text-muted-foreground">Max Fiat</span>
			<span class="text-right">{env.settings.OPENPLEB_MAX_FIAT_AMOUNT} {env.settings.OPENPLEB_CURRENCY}</span>

			<!-- Platform Fees -->
			<span class="text-muted-foreground">Platform Fee %</span>
			<span class="text-right">{formatPercentage(env.settings.OPENPLEB_PLATFORM_FEE_PERCENTAGE)}</span>

			<span class="text-muted-foreground">Platform Fee Flat</span>
			<span class="text-right">{formatSats(env.settings.OPENPLEB_PLATFORM_FEE_FLAT_RATE)}</span>

			<!-- Taker Fees -->
			<span class="text-muted-foreground">Taker Fee %</span>
			<span class="text-right">{formatPercentage(env.settings.OPENPLEB_TAKER_FEE_PERCENTAGE)}</span>

			<span class="text-muted-foreground">Taker Fee Flat</span>
			<span class="text-right">{formatSats(env.settings.OPENPLEB_TAKER_FEE_FLAT_RATE)}</span>

			<!-- Bond -->
			<span class="text-muted-foreground">Bond %</span>
			<span class="text-right">{formatPercentage(env.settings.OPENPLEB_BOND_PERCENTAGE)}</span>

			<span class="text-muted-foreground">Bond Flat</span>
			<span class="text-right">{formatSats(env.settings.OPENPLEB_BOND_FLAT_RATE)}</span>

			<!-- Mint URL -->
			<span class="text-muted-foreground">Mint URL</span>
			<span class="text-right truncate" title={env.settings.OPENPLEB_MINT_URL}>{env.settings.OPENPLEB_MINT_URL}</span>
		</div>
	</div>
{:else}
	<div class="rounded-xl border border-border p-3 text-center text-xs text-muted-foreground">
		Loading environment settings...
	</div>
{/if}
