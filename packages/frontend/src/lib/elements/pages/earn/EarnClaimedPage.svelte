<script lang="ts">
	import { browser } from '$app/environment';
	import { env } from '$env/dynamic/public';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import Input from '$lib/components/ui/input/input.svelte';
	import CopiableToken from '$lib/elements/CopiableToken.svelte';
	import Expiry from '$lib/elements/Expiry.svelte';
	import { ensureError } from '$lib/errors.js';
	import { formatCurrency, objectUrlToBase64 } from '$lib/helper';
	import { dataStore } from '$lib/stores/session/data.svelte';
	import { keysStore } from '@gandlaf21/cashu-wallet-engine';
	import type { Claim, FiatProvider, Offer } from '@openPleb/common/db/schema';
	import { Check, LoaderCircle, Pencil, Trash, Upload } from 'lucide-svelte';
	import encodeQR from 'qr';
	import Dropzone from 'svelte-file-dropzone';
	import { toast } from 'svelte-sonner';
	
    const { PUBLIC_API_VERSION, PUBLIC_BACKEND_URL} = env;
	const { OPENPLEB_CURRENCY } = dataStore.env
    interface Props {offer:Offer}
    
    let {offer}: Props = $props();
    let claim: Claim | undefined = $derived(dataStore.claims.find((c) => c.offerId === offer.id));
    let isPaid = $state(false);
	let isLoading = $state(false);
	let file = $state('');
	let showSkipDialog = $state(false);
	let skipReason = $state('');
	let isDrawingMode = $state(false);
	let penSize = $state(10); // Default: small
	let canvas: HTMLCanvasElement | null = $state(null);
	let canvasContext: CanvasRenderingContext2D | null = $state(null);
	let isDrawing = $state(false);
	let lastX = 0;
	let lastY = 0;
	
// Find the fiat provider for this offer
let fiatProvider: FiatProvider | undefined = $derived(
	offer.fiatProviderId 
		? dataStore.providers.find(p => p.id === offer.fiatProviderId) 
		: undefined
);

function initializeCanvas() {
	if (!canvas || !file) return;
	
	const img = new Image();
	img.onload = () => {
		if (!canvas) return;
		
		canvas.width = img.width;
		canvas.height = img.height;
		
		canvasContext = canvas.getContext('2d');
		if (!canvasContext) return;
		
		canvasContext.drawImage(img, 0, 0, canvas.width, canvas.height);
		canvasContext.lineCap = 'round';
		canvasContext.lineJoin = 'round';
		canvasContext.strokeStyle = 'black';
		canvasContext.lineWidth = penSize;
	};
	
	img.src = file;
}

function startDrawing(e: MouseEvent | TouchEvent) {
	if (!canvasContext || !canvas) return;
	isDrawing = true;
	
	// Get coordinates with scaling factor correction
	const rect = canvas.getBoundingClientRect();
	const scaleX = canvas.width / rect.width;
	const scaleY = canvas.height / rect.height;
	
	const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
	const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
	
	// Calculate coordinates relative to canvas and apply scaling
	const x = (clientX - rect.left) * scaleX;
	const y = (clientY - rect.top) * scaleY;
	
	lastX = x;
	lastY = y;
}

function draw(e: MouseEvent | TouchEvent) {
	if (!isDrawing || !canvasContext || !canvas) return;
	e.preventDefault();
	
	// Get coordinates with scaling factor correction
	const rect = canvas.getBoundingClientRect();
	const scaleX = canvas.width / rect.width;
	const scaleY = canvas.height / rect.height;
	
	const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
	const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
	
	// Calculate coordinates relative to canvas and apply scaling
	const x = (clientX - rect.left) * scaleX;
	const y = (clientY - rect.top) * scaleY;
	
	// Draw line
	canvasContext.beginPath();
	canvasContext.moveTo(lastX, lastY);
	canvasContext.lineTo(x, y);
	canvasContext.stroke();
	
	lastX = x;
	lastY = y;
}

function stopDrawing() {
	isDrawing = false;
	
	// Update the file blob with the new canvas content
	if (canvas && browser) {
		canvas.toBlob(blob => {
			if (blob) {
				// Release the old object URL to avoid memory leaks
				URL.revokeObjectURL(file);
				// Create a new object URL from the blob
				file = URL.createObjectURL(blob);
			}
		}, 'image/png');
	}
}

function setPenSize(size: number) {
	penSize = size;
	if (canvasContext) {
		canvasContext.lineWidth = size;
	}
}

function toggleDrawingMode() {
	isDrawingMode = !isDrawingMode;
	if (isDrawingMode && file) {
		// Initialize canvas on next tick to ensure DOM is updated
		setTimeout(initializeCanvas, 0);
	}
}

	const upload = async () => {
		if (!file) {
			toast.error('No file selected');
			return;
		}
		if (!offer) {
			toast.error('No offer found');
			return;
		}

		isLoading = true;
		if (browser) {
			objectUrlToBase64(file, async (b64: string) => {
				try {
					const response = await fetch(
						`${PUBLIC_BACKEND_URL}/api/${PUBLIC_API_VERSION}/offers/${offer?.id}/receipt`,
						{
							method: 'POST',
							headers: {
								'Content-Type': 'application/json'
							},
							// todo, signature should be added here?
							body: JSON.stringify({
								pubkey: $keysStore[0]?.publicKey,
								receiptImg: b64
							})
							
						}
					);
					if (!response.ok) {
						throw new Error(await response.text());
					}
					toast.success('Receipt uploaded successfully!');
				} catch (error) {
					const err = ensureError(error);
					console.error(err);
					toast.error(err.message);
				} finally {
					isLoading = false;
				}
			});
		}
		// upload the file to the server
	};
	const skipReceipt = async () => {
		if (!offer) {
			toast.error('No offer found');
			return;
		}
		const pubkey = $keysStore[0]?.publicKey;
		if (!pubkey) {
			toast.error('Wallet not found');
			return;
		}
		const reason = skipReason.trim();
		isLoading = true;
		try {
			const response = await fetch(
				`${PUBLIC_BACKEND_URL}/api/${PUBLIC_API_VERSION}/offers/${offer?.id}/receipt`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						pubkey,
						skip: true,
						reason
					})
				}
			);
			if (!response.ok) {
				throw new Error(await response.text());
			}
			toast.success('Receipt upload skipped. Maker were notified.');
			showSkipDialog = false;
			skipReason = '';
			file = '';
			isPaid = false;
		} catch (error) {
			const err = ensureError(error);
			console.error(err);
			toast.error(err.message);
		} finally {
			isLoading = false;
		}
	};
	function downloadSvgAsJpeg(svgElement: SVGElement, fileName: string, options = { quality: 0.95, scale: 50 }): void {
  // Clone the SVG to avoid modifying the original
  const svgClone = svgElement.cloneNode(true) as SVGElement;
  
  // Get SVG dimensions from viewBox or attributes
  let width: number;
  let height: number;
  
  if (svgClone.getAttribute('viewBox')) {
    const viewBox = svgClone.getAttribute('viewBox')?.split(' ').map(Number);
    width = viewBox?.[2] || svgElement.getBoundingClientRect().width;
    height = viewBox?.[3] || svgElement.getBoundingClientRect().height;
  } else {
    // Try to get width and height attributes, fallback to getBoundingClientRect
    width = Number.parseFloat(svgClone.getAttribute('width') || '') || svgElement.getBoundingClientRect().width;
    height = Number.parseFloat(svgClone.getAttribute('height') || '') || svgElement.getBoundingClientRect().height;
  }
  
  // Set explicit dimensions on the SVG clone
  svgClone.setAttribute('width', width.toString());
  svgClone.setAttribute('height', height.toString());
  
  // Create a canvas element
  const canvas = document.createElement('canvas');
  
  // Set canvas size with scaling for better quality
  canvas.width = width * options.scale;
  canvas.height = height * options.scale;
  
  // Get canvas context
  const context = canvas.getContext('2d');
  
  if (!context) {
    console.error('Canvas 2D context not available');
    return;
  }
  
  // Set white background
  context.fillStyle = 'white';
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // Scale the context for higher resolution
  context.scale(options.scale, options.scale);
  
  // Get SVG data with correct dimensions
  const svgData = new XMLSerializer().serializeToString(svgClone);
  
  // Create a blob for the SVG
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(svgBlob);
  
  // Create an image element
  const img = new Image();
  
  // Set up image loading handler
  img.onload = () => {
    // Draw the image to the canvas - using full dimensions
    context.drawImage(img, 0, 0, width, height);
    
    // Convert canvas to JPEG
    canvas.toBlob(
      (blob) => {
        if (blob) {
          // Create a download link
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = fileName || 'image.jpeg';
          
          // Trigger download
          document.body.appendChild(link);
          link.click();
          
          // Clean up
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
        }
      },
      'image/jpeg',
      options.quality
    );
    
    // Clean up
    URL.revokeObjectURL(url);
  };
  
  // Handle error
  img.onerror = (error) => {
    console.error('Error loading SVG:', error);
    URL.revokeObjectURL(url);
  };
  
  // Set the image source to the SVG URL
  img.src = url;
}
	</script>

{#if claim?.pubkey && claim.pubkey === $keysStore[0]?.publicKey}
<div class="flex flex-col gap-2 w-full border p-2 rounded-md">
	{#if isPaid}
		<p class="text-center text-xl font-bold">
			Upload a screenshot of the receipt to verify the payment.
		</p>
		<div class="w-full">
			{#if file}
				<div class="relative">
					{#if isDrawingMode}
						<!-- Drawing mode -->
						<div class="flex flex-col gap-3">
							<!-- Drawing tools -->
							<div class="flex justify-between items-center mb-2">
								<div class="flex items-center gap-3">
									<div class="flex gap-1">
										<Button 
											size="sm" 
											variant={penSize === 10 ? "default" : "outline"} 
											class="p-1 h-8 w-8" 
											onclick={() => setPenSize(10)}
										>
											<div class="w-2 h-2 bg-black rounded-full"></div>
										</Button>
										<Button 
											size="sm" 
											variant={penSize === 25 ? "default" : "outline"} 
											class="p-1 h-8 w-8" 
											onclick={() => setPenSize(25)}
										>
											<div class="w-3 h-3 bg-black rounded-full"></div>
										</Button>
										<Button 
											size="sm" 
											variant={penSize === 50 ? "default" : "outline"} 
											class="p-1 h-8 w-8" 
											onclick={() => setPenSize(50)}
										>
											<div class="w-4 h-4 bg-black rounded-full"></div>
										</Button>
									</div>
								</div>
								<Button 
									size="sm" 
									variant="outline"
									class="h-8" 
									onclick={toggleDrawingMode}
								>
									<Check class="h-4 w-4 mr-1" />
									Done
								</Button>
							</div>
							
							<!-- Canvas for drawing -->
							<div class="px-[20%]">
								<canvas
									bind:this={canvas}
									onmousedown={startDrawing}
									onmousemove={draw}
									onmouseup={stopDrawing}
									onmouseleave={stopDrawing}
									ontouchstart={startDrawing}
									ontouchmove={draw}
									ontouchend={stopDrawing}
									ontouchcancel={stopDrawing}
									class="touch-none w-full rounded-md border"
								></canvas>
							</div>
						</div>
					{:else}
						<!-- View mode -->
						<div>
							<div class="absolute top-2 right-2 z-10 flex gap-1">
								<Button
									size="icon"
									variant="outline"
									class="h-8 w-8 bg-white/80"
									onclick={toggleDrawingMode}
								>
									<Pencil class="h-4 w-4" />
								</Button>
								<Button
									size="icon"
									variant="outline"
									class="h-8 w-8 bg-white/80"
									onclick={() => {
										file = '';
									}}
								>
									<Trash class="h-4 w-4" />
								</Button>
							</div>
							<img id="receiptImage" src={file} alt="" class="rounded-md px-[20%]" />
						</div>
					{/if}
				</div>
			{:else}
				<Dropzone
					containerClasses="h-full"
					accept=".png,.jpg,.jpeg"
					multiple={false}
					maxSize={1024 * 1024 * 5}
					on:drop={(e) => {
						file = URL.createObjectURL(e.detail.acceptedFiles[0]);
					}}
				>
					Click here or drop a screenshot of the receipt to upload
				</Dropzone>
			{/if}
		</div>
		{#if file}
		
		<Button disabled={!file || isLoading} onclick={upload}>
			{#if isLoading}
			<LoaderCircle class="animate-spin"></LoaderCircle>
			{:else}
			<Upload></Upload>
			{/if}
			Upload
		</Button>
		{/if}

		{#if !offer.receiptSkipped}
		<Button
			class="mt-4 w-full"
			variant="outline"
			disabled={isLoading}
			onclick={() => {
				showSkipDialog = true;
			}}
		>
			I can't upload a receipt
		</Button>

		<Dialog.Root bind:open={showSkipDialog}>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Skip receipt upload</Dialog.Title>
					<Dialog.Description>
						Provide a short reason so maker can review your payment without a receipt.
					</Dialog.Description>
				</Dialog.Header>
				<Input
					placeholder="Reason for skipping"
					bind:value={skipReason}
					disabled={isLoading}
				/>
				<Dialog.Footer>
					<Button
						variant="outline"
						disabled={isLoading}
						onclick={() => {
							showSkipDialog = false;
							skipReason = '';
						}}
					>
						Cancel
					</Button>
					<Button disabled={isLoading} onclick={skipReceipt}>
						Confirm skip
					</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
		{/if}

		<Button
			class="mt-10"
			variant="link"
			onclick={() => {
				isPaid = false;
				showSkipDialog = false;
				skipReason = '';
			}}
		>
			Back
		</Button>
	{:else}
		<!-- Payment amount display -->
		<div class="flex flex-col items-center gap-2 mb-4">
			<p class="text-center text-lg text-muted-foreground">Please pay:</p>
			<div class="text-center text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
				{formatCurrency(offer.amount, OPENPLEB_CURRENCY)}
			</div>
			
			{#if fiatProvider}
			<div class="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
				<p>via</p>
				{#if fiatProvider.icon}
				<img src={fiatProvider.icon} alt={fiatProvider.label} class="w-5 h-5" />
				{/if}
				<p class="font-medium">{fiatProvider.label}</p>
			</div>
			{/if}
		</div>
		
		<div class="w-full rounded-md border p-2 bg-white" id="qr-code-container">
			{@html encodeQR(offer.qrCode, 'svg')}
		</div>
		<!-- QR code plaintext and options -->
		<div class="mt-4 bg-muted/30 rounded-md p-3">
			<div class="mb-2">
				<p class="text-sm font-medium text-muted-foreground mb-1">QR Code Content:</p>
					<CopiableToken token={offer.qrCode}></CopiableToken>
			</div>
			
			<div class="flex gap-2 items-center">
				<Button class="w-full" size='lg' variant='outline' onclick={()=> {
					if (browser) {
						downloadSvgAsJpeg(document.getElementById('qr-code-container')?.firstChild as SVGElement, 'qr.jpg')
					}
				}}>
					Download as Image
				</Button>
			</div>
		</div>
		<Button
			class="mt-10"
			onclick={() => {
				isPaid = true;
			}}
		>
			I paid it
		</Button>
	{/if}
	<div>
		<p class="font-semibold mb-1">Expiry</p>
		<Expiry offer={offer} />
	</div>
</div>

{:else}
<p>
    This offer was claimed by somebody else.
</p>
{/if}
