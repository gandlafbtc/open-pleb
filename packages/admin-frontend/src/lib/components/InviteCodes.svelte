<script lang="ts">
	import { inviteCodesService } from '$lib/services/invite-codes.service';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Card from '$lib/components/ui/card';
	import * as Alert from '$lib/components/ui/alert';
	import { Loader2 } from '@lucide/svelte';


	let count = $state(10);
	let expiresInDays = $state<number | undefined>(undefined);
	let useExpiration = $state(false);
	let isLoading = $state(false);
	let error = $state<string | null>(null);


	async function handleGenerate() {
		isLoading = true;
		error = null;

		try {
			// Calculate expiration timestamp if enabled
			let expiresAt: number | undefined;
			if (useExpiration && expiresInDays) {
				const now = Math.floor(Date.now() / 1000);
				expiresAt = now + expiresInDays * 24 * 60 * 60;
			}

			await inviteCodesService.generateCodes(count, expiresAt);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to generate codes';
			console.error('Generate codes error:', err);
		} finally {
			isLoading = false;
		}
	}




</script>

<div class="space-y-6">
	<Card.Root>
		<Card.Header>
			<Card.Title>Generate Invite Codes</Card.Title>
			<Card.Description>Create new invite codes for user registration</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			{#if error}
				<Alert.Root variant="destructive">
					<Alert.Description>{error}</Alert.Description>
				</Alert.Root>
			{/if}

			<div class="space-y-2">
				<Label for="count">Number of codes (1-100)</Label>
				<Input
					id="count"
					type="number"
					bind:value={count}
					min={1}
					max={100}
					placeholder="Enter number of codes"
				/>
			</div>

			<div class="flex items-center space-x-2">
				<Checkbox id="useExpiration" bind:checked={useExpiration} />
				<Label for="useExpiration" class="text-sm font-normal cursor-pointer">
					Set expiration date
				</Label>
			</div>

			{#if useExpiration}
				<div class="space-y-2">
					<Label for="expiresInDays">Expires in (days)</Label>
					<Input
						id="expiresInDays"
						type="number"
						bind:value={expiresInDays}
						min={1}
						placeholder="Enter number of days"
					/>
				</div>
			{/if}

			<Button
				onclick={handleGenerate}
				disabled={isLoading || count < 1 || count > 100}
				class="w-full"
			>
				{#if isLoading}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					Generating...
				{:else}
					Generate Codes
				{/if}
			</Button>
		</Card.Content>
	</Card.Root>

</div>
