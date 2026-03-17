<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { backendUrl } from '$lib/state/dynamic/backendUrl.svelte';
	import { PUBLIC_BACKEND_URL } from '$env/static/public';
	import { toast } from 'svelte-sonner';

	let urlInput: string = $state('');
	let isValidating: boolean = $state(false);
	let errorMessage: string = $state('');

	const currentUrl = $derived(backendUrl.url);
	const isDefault = $derived(currentUrl === PUBLIC_BACKEND_URL);

	function validateUrl(url: string): boolean {
		errorMessage = '';
		
		if (!url.trim()) {
			errorMessage = 'URL cannot be empty';
			return false;
		}

		try {
			new URL(url);
			return true;
		} catch {
			errorMessage = 'Invalid URL format';
			return false;
		}
	}

	async function saveBackendUrl() {
		const trimmed = urlInput.trim();
		if (!trimmed) return;

		if (!validateUrl(trimmed)) {
			toast.error(errorMessage);
			return;
		}

		isValidating = true;
		try {
			await backendUrl.setUrl(trimmed);
			urlInput = '';
			errorMessage = '';
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to save backend URL';
			errorMessage = message;
			toast.error(message);
		} finally {
			isValidating = false;
		}
    }
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-col gap-2">
		<div class="flex gap-2">
			<Input
				id="backend-url-input"
				type="url"
				placeholder={currentUrl || 'Enter backend URL'}
				bind:value={urlInput}
				disabled={isValidating}
				onkeydown={(e) => {
					if (e.key === 'Enter') saveBackendUrl();
				}}
			/>
			<Button 
				onclick={saveBackendUrl} 
				disabled={!urlInput.trim() || isValidating}
			>
				{isValidating ? 'Connecting...' : 'Connect'}
			</Button>
		</div>
		{#if errorMessage}
			<p class="text-destructive text-sm">{errorMessage}</p>
		{/if}
	</div>
</div>
