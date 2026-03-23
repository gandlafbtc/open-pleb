<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import decodeQR from 'qr/decode.js';
	import { lastScan } from '$lib/state/cache/lastScan.svelte';
	import Progress from '$lib/components/ui/progress/progress.svelte';
	import { walletView } from '$lib/state/walletView.svelte';

	let videoEl: HTMLVideoElement;
	let canvasEl: HTMLCanvasElement;
	let stream: MediaStream | null = null;
	let animFrameId: number;
	let resumeTimeout: ReturnType<typeof setTimeout> | null = null;

	let scanning = $state(true);
	let error = $state('');

	let scanProcess = $state('');
	let completion = $state(0);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let decoder: any = null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let DecoderClass: any = null;

	onMount(async () => {
		// Dynamically import bc-ur only in browser environment
		const bcUrModule = await import('@gandlaf21/bc-ur');
		DecoderClass = bcUrModule.URDecoder;
		await startCamera();
	});

	onDestroy(() => {
		stopCamera();
		if (resumeTimeout) clearTimeout(resumeTimeout);
	});

	async function startCamera() {
		error = '';
		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
			});
			videoEl.srcObject = stream;
			await videoEl.play();
			scanning = true;
			requestScan();
		} catch (e) {
			error = 'Could not access camera. Please allow camera permissions.';
			console.error(e);
		}
	}

	function stopCamera() {
		scanning = false;
		if (animFrameId) {
			cancelAnimationFrame(animFrameId);
		}
		if (stream) {
			stream.getTracks().forEach((t) => t.stop());
			stream = null;
		}
	}

	function requestScan() {
		if (!scanning) return;
		animFrameId = requestAnimationFrame(scanFrame);
	}

	function scanFrame() {
		if (!scanning || !videoEl || videoEl.readyState !== videoEl.HAVE_ENOUGH_DATA) {
			requestScan();
			return;
		}

		const width = videoEl.videoWidth;
		const height = videoEl.videoHeight;

		canvasEl.width = width;
		canvasEl.height = height;

		const ctx = canvasEl.getContext('2d', { willReadFrequently: true })!;
		ctx.drawImage(videoEl, 0, 0, width, height);

		const imageData = ctx.getImageData(0, 0, width, height);

		try {
			const decoded = decodeQR({ width, height, data: imageData.data });
			if (decoded) {
				if (decoded.startsWith('ur:')) {
					const chunkProcess = decoded.split('/')[2];
					if (!decoder) {
							decoder = new DecoderClass();
						}
						scanProcess = chunkProcess;
						decoder.receivePart(decoded);
						
						completion = Math.floor(decoder.estimatedPercentComplete() * 100);
						console.error(error)
					}
					if (!decoder.isComplete()) {
						requestScan();
						return;
					}
					if (!decoder.isSuccess()) {
						throw new Error(`${decoder.resultError()}`);
					}
					
					const ur = decoder.resultUR();
					const decodedUR = ur.decodeCBOR();
					const scannedToken = decodedUR.toString();
					console.log()
					lastScan.scan = scannedToken;
					scanning=false
					walletView.setView("receive")
				}
		} catch (e){
			// No QR found in this frame, continue scanning
		}
		requestScan();
	}
</script>

<div class="flex flex-col items-center gap-4 p-4">
	{#if error}
		<div class="alert alert-error max-w-md">
			<span>{error}</span>
		</div>
		<button
			class="btn btn-primary"
			onclick={() => {
				error = '';
				startCamera();
			}}>Retry</button
		>
	{:else}
		<div class="relative w-full max-w-md overflow-hidden rounded-lg shadow-xl">
			<!-- svelte-ignore element_invalid_self_closing_tag -->
			<video bind:this={videoEl} class="w-full" playsinline muted />
			<!-- Scanning overlay -->
			<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
				<div class="h-48 w-48 rounded-lg border-2 border-primary opacity-70"></div>
			</div>
			{#if scanning}
				<div class="absolute right-0 bottom-2 left-0 flex justify-center">
					<span class="badge badge-primary gap-1">
						<span class="loading loading-dots loading-xs"></span>
						Scanning...
					</span>
				</div>
				{#if completion}
					<Progress value={completion - 5} max={100} class="w-full" />
				{/if}
			{/if}
		</div>
	{/if}

	<canvas bind:this={canvasEl} class="hidden"></canvas>
</div>
