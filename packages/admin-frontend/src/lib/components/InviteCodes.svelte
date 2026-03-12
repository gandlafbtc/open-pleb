<script lang="ts">
	import { inviteCodesService, type InviteCode } from '$lib/services/invite-codes.service';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Card from '$lib/components/ui/card';
	import * as Alert from '$lib/components/ui/alert';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { Loader2, Copy, Check, Calendar, Clock } from '@lucide/svelte';

	let count = $state(10);
	let expiresInDays = $state<number | undefined>(undefined);
	let useExpiration = $state(false);
	let isLoading = $state(false);
	let error = $state<string | null>(null);
	let generatedCodes = $state<InviteCode[]>([]);
	let copiedIndex = $state<number | null>(null);
	let copiedAll = $state(false);

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

			const codes = await inviteCodesService.generateCodes(count, expiresAt);
			generatedCodes = codes;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to generate codes';
			console.error('Generate codes error:', err);
		} finally {
			isLoading = false;
		}
	}

	async function copyCode(code: string, index: number) {
		try {
			await navigator.clipboard.writeText(code);
			copiedIndex = index;
			setTimeout(() => {
				copiedIndex = null;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}

	async function copyAllCodes() {
		try {
			const allCodes = generatedCodes.map((c) => c.inviteCode).join('\n');
			await navigator.clipboard.writeText(allCodes);
			copiedAll = true;
			setTimeout(() => {
				copiedAll = false;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy all codes:', err);
		}
	}

	function formatDate(timestamp: number): string {
		return new Date(timestamp * 1000).toLocaleString();
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

	{#if generatedCodes.length > 0}
		<Card.Root>
			<Card.Header>
				<div class="flex items-center justify-between">
					<div>
						<Card.Title>Generated Codes</Card.Title>
						<Card.Description>{generatedCodes.length} codes created</Card.Description>
					</div>
					<Button variant="outline" size="sm" onclick={copyAllCodes}>
						{#if copiedAll}
							<Check class="mr-2 h-4 w-4" />
							Copied!
						{:else}
							<Copy class="mr-2 h-4 w-4" />
							Copy All
						{/if}
					</Button>
				</div>
			</Card.Header>
			<Card.Content>
				<ScrollArea class="h-96 w-full">
					<div class="space-y-3">
						{#each generatedCodes as code, index (code.inviteCode)}
							<div class="flex items-start justify-between rounded-lg border bg-muted/50 p-4">
								<div class="flex-1 space-y-2">
									<code class="text-sm font-mono break-all">{code.inviteCode}</code>
									<div class="flex flex-wrap gap-3 text-xs text-muted-foreground">
										<span class="flex items-center gap-1">
											<Clock class="h-3 w-3" />
											Created: {formatDate(code.codeCreatedAt)}
										</span>
										{#if code.codeExpiresAt}
											<span class="flex items-center gap-1">
												<Calendar class="h-3 w-3" />
												Expires: {formatDate(code.codeExpiresAt)}
											</span>
										{/if}
									</div>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onclick={() => copyCode(code.inviteCode, index)}
									class="ml-4 shrink-0"
								>
									{#if copiedIndex === index}
										<Check class="h-4 w-4" />
									{:else}
										<Copy class="h-4 w-4" />
									{/if}
								</Button>
							</div>
						{/each}
					</div>
				</ScrollArea>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
