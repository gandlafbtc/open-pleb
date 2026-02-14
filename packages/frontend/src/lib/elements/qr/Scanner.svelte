<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import decodeQR from 'qr/decode.js';

	let videoEl: HTMLVideoElement;
	let canvasEl: HTMLCanvasElement;
	let stream: MediaStream | null = null;
	let animFrameId: number;
	let resumeTimeout: ReturnType<typeof setTimeout> | null = null;

	let scanning = $state(true);
	let showPopup = $state(false);
	let error = $state('');

	onMount(async () => {
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
				scanning = false;
				showPopup = true;
				return;
			}
		} catch {
			// No QR found in this frame, continue scanning
		}

		requestScan();
	}


</script>

<div class="flex flex-col items-center p-4 gap-4">
	{#if error}
		<div class="alert alert-error max-w-md">
			<span>{error}</span>
		</div>
		<button class="btn btn-primary" onclick={() => { error = ''; startCamera(); }}>Retry</button>
	{:else}
		<div class="relative max-w-md w-full rounded-lg overflow-hidden shadow-xl">
			<!-- svelte-ignore element_invalid_self_closing_tag -->
			<video bind:this={videoEl} class="w-full" playsinline muted />
			<!-- Scanning overlay -->
			<div class="absolute inset-0 flex items-center justify-center pointer-events-none">
				<div class="w-48 h-48 border-2 border-primary rounded-lg opacity-70"></div>
			</div>
			{#if scanning}
				<div class="absolute bottom-2 left-0 right-0 flex justify-center">
					<span class="badge badge-primary gap-1">
						<span class="loading loading-dots loading-xs"></span>
						Scanning...
					</span>
				</div>
			{/if}
		</div>
	{/if}

	<canvas bind:this={canvasEl} class="hidden"></canvas>
</div>
