<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { Buffer } from 'buffer';
	import QrCode from './QRCode.svelte';
	import Slider from '$lib/components/ui/slider/slider.svelte';

	type UREncoder = {
		nextPart: () => string;
	};

	type UR = {
		fromBuffer: (buffer: Buffer) => unknown;
	};

	type BCURModule = {
		UREncoder: new (ur: unknown, maxFragmentLength: number, firstSeqNum: number) => UREncoder;
		UR: UR;
	};

	let { token, speed, size }: { token: string; speed: number[]; size: number[] } = $props();

	let chunk = $state('');
	let maxFragmentLength = $derived(size[0] * 50);
	let intervalMS = $derived(1000 / speed[0]);
	const firstSeqNum = 0;
	let encoder: UREncoder | null = null;
	let bcUrModule: BCURModule | null = null;

	let qrInterval: ReturnType<typeof setInterval> | undefined;


	$effect(() => {
		if (intervalMS || maxFragmentLength) {
			doInterval();
		}
	});

	const doInterval = async () => {
		if (!browser || !bcUrModule) return;
		
		const { UREncoder, UR } = bcUrModule;
		const ur = UR.fromBuffer(Buffer.from(token));
		encoder = new UREncoder(ur, maxFragmentLength, firstSeqNum);
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
			bcUrModule = await import('@gandlaf21/bc-ur');
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
						<span>Speed</span>
						<Slider bind:value={speed} max={10} min={1} step={1} />
					</div>
					<div class="flex gap-2">
						<span>Size</span>
						<Slider bind:value={size} max={10} min={1} step={1} />
					</div>
					</div>
{/if}
