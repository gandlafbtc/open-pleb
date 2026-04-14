<script lang="ts">
	import { Button } from "$lib/components/ui/button";
	import { Upload } from "@lucide/svelte";

	interface Props {
		value?: string;
		onchange?: (iconDataUrl: string) => void;
		onerror?: (error: string) => void;
	}

	let { value = $bindable(""), onchange, onerror }: Props = $props();

	let fileInput: HTMLInputElement;
	let iconPreview = $state<string | null>(null);
	let originalPreview = $state<string | null>(null);
	let isDragging = $state(false);

	// Update previews when value changes externally
	$effect(() => {
		if (value && value.startsWith("data:")) {
			iconPreview = value;
		} else if (!value) {
			iconPreview = null;
			originalPreview = null;
		}
	});

	async function processFile(file: File) {
		// Validate file type
		if (!file.type.startsWith("image/")) {
			onerror?.("Please upload an image file");
			return;
		}

		// Load and process image
		const img = new Image();
		const reader = new FileReader();

		reader.onload = (e) => {
			const originalDataUrl = e.target?.result as string;
			originalPreview = originalDataUrl;

			img.onload = () => {
				try {
					// Create canvas for 128x128 output
					const canvas = document.createElement("canvas");
					canvas.width = 128;
					canvas.height = 128;
					const ctx = canvas.getContext("2d");

					if (!ctx) {
						onerror?.("Failed to process image");
						return;
					}

					// Calculate scaling to fill 128x128 (scale to fill, crop excess)
					const scale = Math.max(128 / img.width, 128 / img.height);
					const scaledWidth = img.width * scale;
					const scaledHeight = img.height * scale;

					// Center the image
					const x = (128 - scaledWidth) / 2;
					const y = (128 - scaledHeight) / 2;

					// Draw image on canvas
					ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

					// Convert to PNG data URL
					const dataUrl = canvas.toDataURL("image/png");
					value = dataUrl;
					iconPreview = dataUrl;
					onchange?.(dataUrl);
				} catch {
					onerror?.("Failed to process image");
					iconPreview = null;
					originalPreview = null;
					value = "";
				}
			};

			img.onerror = () => {
				onerror?.("Failed to load image");
				iconPreview = null;
				originalPreview = null;
				value = "";
			};

			img.src = originalDataUrl;
		};

		reader.onerror = () => {
			onerror?.("Failed to read file");
		};

		reader.readAsDataURL(file);
	}

	async function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (!file) {
			return;
		}

		await processFile(file);
	}

	function clearIcon() {
		value = "";
		iconPreview = null;
		originalPreview = null;
		if (fileInput) {
			fileInput.value = "";
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
	}

	async function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;

		const file = event.dataTransfer?.files[0];
		if (file) {
			await processFile(file);
		}
	}

	function handleBrowseClick() {
		fileInput?.click();
	}
</script>

<div class="space-y-4">
	<!-- Drop Zone -->
	<div
		class="relative border-2 border-dashed rounded-lg transition-colors {isDragging
			? 'border-primary bg-primary/5'
			: 'border-muted-foreground/25 hover:border-muted-foreground/50'}"
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
		role="button"
		tabindex="0"
	>
		<input
			bind:this={fileInput}
			type="file"
			accept="image/*"
			onchange={handleFileChange}
			class="hidden"
		/>

		{#if originalPreview && iconPreview}
			<!-- Preview State -->
			<div class="p-6">
				<div class="flex gap-6 items-center justify-center">
					<div class="flex flex-col items-center gap-2">
						<div class="text-xs text-muted-foreground font-medium">Original</div>
						<img
							src={originalPreview}
							alt="Original"
							class="max-w-24 max-h-24 border rounded object-contain"
						/>
					</div>
					<div class="flex flex-col items-center gap-2">
						<div class="text-xs text-muted-foreground font-medium">Processed (128x128)</div>
						<img src={iconPreview} alt="Processed preview" class="w-16 h-16 border rounded" />
					</div>
				</div>
				<div class="flex justify-center mt-4">
					<Button type="button" variant="outline" size="sm" onclick={clearIcon}> Clear </Button>
				</div>
			</div>
		{:else}
			<!-- Empty State -->
			<div class="p-8 text-center">
				<div class="flex justify-center mb-4">
					<div class="p-3 bg-muted rounded-full">
						<Upload class="w-6 h-6 text-muted-foreground" />
					</div>
				</div>
				<p class="text-sm text-muted-foreground mb-4">
					Drag and drop an image here, or click to browse
				</p>
				<Button type="button" variant="ghost" onclick={handleBrowseClick}> Browse Files </Button>
				<p class="text-xs text-muted-foreground mt-4">
					Image will be converted to 128x128 PNG
				</p>
			</div>
		{/if}
	</div>
</div>
