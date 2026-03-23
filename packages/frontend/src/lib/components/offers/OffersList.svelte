<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { clock } from '$lib/state/clock.svelte';
	import { getUnixNow } from 'common/util';

	// Mock data type - replace with actual type later
	interface Offer {
		id: string;
		youEarn: number;
		totalAmount: number;
		expiresAt: number;
	}

	// Mock data for demonstration
	const mockOffers: Offer[] = [
		{ id: '1', youEarn: 113, totalAmount: 723, expiresAt: getUnixNow() + 300 },
		{ id: '2', youEarn: 7263, totalAmount: 180000, expiresAt: getUnixNow() + 180 },
		{ id: '3', youEarn: 200, totalAmount: 1000, expiresAt: getUnixNow() + 123},
		{ id: '4', youEarn: 456, totalAmount: 2500, expiresAt: getUnixNow() + 80 }
	];

	const displayOffers = mockOffers;

	function formatSats(amount: number): string {
		return amount.toLocaleString();
	}

	// Helper function to interpolate between two RGB colors
	function interpolateColor(color1: number[], color2: number[], factor: number): string {
		const r = Math.round(color1[0] + (color2[0] - color1[0]) * factor);
		const g = Math.round(color1[1] + (color2[1] - color1[1]) * factor);
		const b = Math.round(color1[2] + (color2[2] - color1[2]) * factor);
		return `rgb(${r}, ${g}, ${b})`;
	}

	function getTimerData(expiresAt: number) {
		const now = clock.time;
		const timeRemaining = Math.max(0, expiresAt - now);
		const maxTime = 300; // 5 minutes in seconds
		
		// Calculate progress (0 to 1, where 1 is full circle at 5 min, 0 is empty at expiry)
		const progress = Math.min(timeRemaining / maxTime, 1);
		
		// Dynamic color interpolation based on progress
		// Color stops: Green (100%) -> Yellow (50%) -> Orange (25%) -> Red (0%)
		const green = [34, 197, 94];    // green-500
		const yellow = [234, 179, 8];   // yellow-500
		const orange = [249, 115, 22];  // orange-500
		const red = [239, 68, 68];      // red-500
		
		let color: string;
		if (progress > 0.5) {
			// Interpolate between green and yellow (100% -> 50%)
			const factor = (1 - progress) / 0.5; // 0 at 100%, 1 at 50%
			color = interpolateColor(green, yellow, factor);
		} else if (progress > 0.25) {
			// Interpolate between yellow and orange (50% -> 25%)
			const factor = (0.5 - progress) / 0.25; // 0 at 50%, 1 at 25%
			color = interpolateColor(yellow, orange, factor);
		} else {
			// Interpolate between orange and red (25% -> 0%)
			const factor = (0.25 - progress) / 0.25; // 0 at 25%, 1 at 0%
			color = interpolateColor(orange, red, factor);
		}
		
		// Format time display
		const minutes = Math.floor(timeRemaining / 60);
		const seconds = Math.floor(timeRemaining % 60);
		const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;
		
		return { progress, color, timeDisplay, expired: timeRemaining <= 0 };
	}
</script>

<div class="space-y-3">
	{#each displayOffers as offer (offer.id)}
		{@const timerData = getTimerData(offer.expiresAt)}
		<button
			class="w-full transition-all active:scale-[0.995]"
			onclick={() => {
				// Handle offer click
				console.log('Offer clicked:', offer.id);
			}}
		>
			<Card class="p-2 border hover:border-primary/50 transition-colors">
				<div class="flex items-center gap-4">
					<!-- Timer Badge with Donut Circle -->
					<div class="flex-shrink-0 relative w-14 h-14">
						<svg class="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
							<!-- Background circle -->
							<circle
								cx="18"
								cy="18"
								r="15.5"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								class="text-muted opacity-20"
							/>
							<!-- Progress circle -->
							<circle
								cx="18"
								cy="18"
								r="15.5"
								fill="none"
								stroke={timerData.color}
								stroke-width="2"
								stroke-dasharray={`${timerData.progress * 97.4} 97.4`}
								stroke-linecap="round"
								class="transition-all duration-300"
							/>
						</svg>
						<!-- Time text in center -->
						<div class="absolute inset-0 flex items-center justify-center">
							<span class="text-xs font-medium" style="color: {timerData.color}">
								{timerData.timeDisplay}
							</span>
						</div>
					</div>

					<!-- You Earn Section -->
					<div class="flex-1 text-left">
						<p class="text-sm text-muted-foreground">you earn</p>
						<p class="font-bold">{formatSats(offer.youEarn)} sats</p>
					</div>

					<!-- Total Amount -->
					<div class="text-right">
						<p class="font-bold">{formatSats(offer.totalAmount)} sats</p>
					</div>
				</div>
			</Card>
		</button>
	{/each}

	{#if displayOffers.length === 0}
		<div class="text-center py-8">
			<p class="text-muted-foreground">No offers available</p>
		</div>
	{/if}
</div>
