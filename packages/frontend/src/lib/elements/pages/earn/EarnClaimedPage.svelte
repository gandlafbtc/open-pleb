<script lang="ts">
	import { browser } from '$app/environment';
	import { env } from '$env/dynamic/public';
	import Button from '$lib/components/ui/button/button.svelte';
	import CopiableToken from '$lib/elements/CopiableToken.svelte';
	import { ensureError } from '$lib/errors.js';
	import { formatCurrency, objectUrlToBase64 } from '$lib/helper';
	import { dataStore } from '$lib/stores/session/data.svelte';
	import type { Claim, Offer } from '@openPleb/common/db/schema';
	import { keysStore } from '@gandlaf21/cashu-wallet-engine';
	import { LoaderCircle, Trash, Upload } from 'lucide-svelte';
	import encodeQR from 'qr';
	import Dropzone from 'svelte-file-dropzone';
	import { toast } from 'svelte-sonner';
	import Expiry from '$lib/elements/Expiry.svelte';
	
    const { PUBLIC_API_VERSION, PUBLIC_BACKEND_URL, PUBLIC_CURRENCY} = env;

    interface Props {offer:Offer}
    
    let {offer}: Props = $props();
    let claim: Claim | undefined = $derived(dataStore.claims.find((c) => c.offerId === offer.id));
    let isPaid = $state(false);
	let isLoading = $state(false);
	let file = $state('');

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
							body: JSON.stringify({
								pubkey: $keysStore[0]?.publicKey,
								receipt: b64
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
    width = parseFloat(svgClone.getAttribute('width') || '') || svgElement.getBoundingClientRect().width;
    height = parseFloat(svgClone.getAttribute('height') || '') || svgElement.getBoundingClientRect().height;
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
					<button
						class="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-all hover:opacity-100"
						onclick={() => {
							file = '';
						}}
					>
						<Trash class="text-white "></Trash>
					</button>
					<img id="receiptImage" src={file} alt="" class="rounded-md px-[20%]" />
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

		<Button
			class="mt-10"
			variant="link"
			onclick={() => {
				isPaid = false;
			}}
		>
			Back
		</Button>
	{:else}
		<p class="text-center text-xl font-bold">
			Pay
			{formatCurrency(offer.amount, PUBLIC_CURRENCY)}
			to
		</p>
		<div class="w-full rounded-md border p-2 bg-white" id="qr-code-container">
			{@html encodeQR(offer.qrCode, 'svg')}
		</div>
		<div class="flex gap-2 items-center">
			<div class="w-full">

				<CopiableToken token={offer.qrCode}></CopiableToken>
			</div>
			<Button class="w-full" size='lg' variant='ghost' onclick={()=> {
				if (browser) {
					downloadSvgAsJpeg(document.getElementById('qr-code-container')?.firstChild, 'qr.jpg')
				}
			}}>
				Download as Image
			</Button>
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
