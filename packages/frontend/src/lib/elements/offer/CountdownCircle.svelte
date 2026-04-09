<script lang="ts">
	import { clock } from '$lib/state/clock.svelte';

	interface Props {
		expiresAt: number;
		compact?: boolean;
	}

	let { expiresAt, compact = false }: Props = $props();

	// Helper function to interpolate between two RGB colors
	function interpolateColor(color1: number[], color2: number[], factor: number): string {
		const r = Math.round(color1[0] + (color2[0] - color1[0]) * factor);
		const g = Math.round(color1[1] + (color2[1] - color1[1]) * factor);
		const b = Math.round(color1[2] + (color2[2] - color1[2]) * factor);
		return `rgb(${r}, ${g}, ${b})`;
	}

	const timerData = $derived.by(() => {
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
	});
</script>

{#if compact}
	<!-- Compact mode: w-4 h-4, no center text -->
	<div class="relative w-4 h-4 flex-shrink-0">
		<svg class="w-4 h-4 -rotate-90" viewBox="0 0 36 36">
			<!-- Background circle -->
			<circle
				cx="18"
				cy="18"
				r="15.5"
				fill="none"
				stroke="currentColor"
				stroke-width="3"
				class="text-muted opacity-20"
			/>
			<!-- Progress circle -->
			<circle
				cx="18"
				cy="18"
				r="15.5"
				fill="none"
				stroke={timerData.color}
				stroke-width="3"
				stroke-dasharray={`${timerData.progress * 97.4} 97.4`}
				stroke-linecap="round"
				class="transition-all duration-300"
			/>
		</svg>
	</div>
{:else}
	<!-- Full mode: w-14 h-14 with center text -->
	<div class="relative w-14 h-14 flex-shrink-0">
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
{/if}
