<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { lnurl } from '$lib/state/persistent/db/repos/lnurl';

	let addressInput: string = $state('');

	const currentAddress = $derived(lnurl.data[0]?.address ?? '');

	async function saveLnurl() {
		const trimmed = addressInput.trim();
		if (!trimmed) return;
		await lnurl.addOrUpdate(trimmed, { address: trimmed }, 'address');
		addressInput = '';
	}
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-col gap-2">
		<Label for="lnurl-input">LNURL Address</Label>
		{#if currentAddress}
			<p class="text-muted-foreground text-sm">
				Current: <span class="text-foreground font-medium">{currentAddress}</span>
			</p>
		{/if}
		<div class="flex gap-2">
			<Input
				id="lnurl-input"
				type="text"
				placeholder={currentAddress || 'Enter LNURL address'}
				bind:value={addressInput}
				onkeydown={(e) => {
					if (e.key === 'Enter') saveLnurl();
				}}
			/>
			<Button onclick={saveLnurl} disabled={!addressInput.trim()}>Save</Button>
		</div>
	</div>
</div>
