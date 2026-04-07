<script lang="ts">
	import type { CocoWallet } from '$lib/state/wallet/wallet.svelte';
	import { Coins } from '@lucide/svelte';
	import { onMount, onDestroy } from 'svelte';

	let wallet: CocoWallet | undefined = $state(undefined) as CocoWallet | undefined;
	let delta = $state<number | null>(null);
	let isVisible = $state(false);
	let animationState = $state<'entering' | 'visible' | 'exiting' | 'hidden'>('hidden');
	let unsubscribe: (() => void) | null = null;

	onMount(async () => {
		const { wallet: w } = await import('$lib/state/wallet/wallet.svelte');
		wallet = w;

		// Subscribe to delta events
		unsubscribe = wallet.onBalanceDelta((deltaValue: number) => {
			showDelta(deltaValue);
		});
	});

	onDestroy(() => {
		if (unsubscribe) {
			unsubscribe();
		}
	});

	function showDelta(deltaValue: number) {
		// If already showing, reset
		if (isVisible) {
			isVisible = false;
			animationState = 'hidden';
			// Small delay before showing new delta
			setTimeout(() => startAnimation(deltaValue), 100);
		} else {
			startAnimation(deltaValue);
		}
	}

	function startAnimation(deltaValue: number) {
		delta = deltaValue;
		isVisible = true;
		animationState = 'entering';

		// Transition to visible state
		setTimeout(() => {
			animationState = 'visible';
		}, 50);

		// Start exit animation after 2 seconds
		setTimeout(() => {
			animationState = 'exiting';
		}, 2000);

		// Hide completely after exit animation
		setTimeout(() => {
			isVisible = false;
			animationState = 'hidden';
			delta = null;
		}, 2300);
	}
</script>

{#if isVisible && delta !== null}
	<div
		class="absolute inset-0 flex items-center justify-center text-sm font-bold transition-all duration-300 ease-out pointer-events-none {animationState === 'entering' ? 'translate-y-8 opacity-0' : ''} {animationState === 'visible' ? 'translate-y-0 opacity-100' : ''} {animationState === 'exiting' ? '-translate-y-8 opacity-0' : ''}"
	>
		<span
			class="flex gap-1 items-center px-2 py-1 rounded-md shadow-lg {delta > 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}"
		>
			<Coins class='w-4 h-4'></Coins>
			{delta > 0 ? '+' : ''}{delta}
		</span>
	</div>
{/if}
