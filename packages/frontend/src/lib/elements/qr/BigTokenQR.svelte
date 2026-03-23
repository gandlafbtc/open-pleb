<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { Buffer } from 'buffer';
	import QrCode from './QRCode.svelte';
	import Slider from '$lib/components/ui/slider/slider.svelte';

	let { token, speed, size }: { token: string; speed: number[]; size: number[] } = $props();

	let chunk = $state('');
	let maxFragmentLength = $derived(size[0] * 50);
	let intervalMS = $derived(1000 / speed[0]);
	const firstSeqNum = 0;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let encoder: any = null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let UREncoderClass: any = null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let URClass: any = null;

	let qrInterval: ReturnType<typeof setInterval> | undefined;

	$effect(() => {
		if (intervalMS || maxFragmentLength) {
			doInterval();
		}
	});

	const doInterval = async () => {
		if (!browser || !UREncoderClass || !URClass) return;

		const ur = URClass.fromBuffer(Buffer.from(token));
		encoder = new UREncoderClass(ur, maxFragmentLength, firstSeqNum);
		clearInterval(qrInterval);
		qrInterval = setInterval(() => {
			if (encoder) {
				chunk = encoder.nextPart();
			}
		}, intervalMS);
	};

	onMount(async () => {
		if (browser) {
			// Dynamically import bc-ur only in browser environment
			const bcUrModule = await import('@gandlaf21/bc-ur');
			UREncoderClass = bcUrModule.UREncoder;
			URClass = bcUrModule.UR;
			await doInterval();
		}
	});
	onDestroy(() => {
		clearInterval(qrInterval);
	});
	
</script>

{#if chunk && size && speed}
	<div class="flex flex-col gap-2">
		<QrCode data={chunk} />
					<div class="flex gap-2">
						<span class="w-20">Speed</span>
						<Slider bind:value={speed} max={10} min={1} step={1} />
					</div>
					<div class="flex gap-2">
						<span class="w-20">Size</span>
						<Slider bind:value={size} max={10} min={1} step={1} />
					</div>
					</div>
{/if}
