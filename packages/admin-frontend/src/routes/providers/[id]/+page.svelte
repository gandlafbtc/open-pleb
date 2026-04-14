<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
	import { page } from "$app/stores";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import * as Card from "$lib/components/ui/card";
	import RegexBuilder from "$lib/components/RegexBuilder.svelte";
	import IconUploader from "$lib/components/IconUploader.svelte";
	import { loadProvider, updateProviderById } from "$lib/services/provider.service";
	import type { FiatProvider } from "common/db/schema";
	import Badge from "$lib/components/ui/badge/badge.svelte";

	let providerId = $derived(parseInt($page.params.id || "0"));
	let provider = $state<FiatProvider | null>(null);
	let label = $state("");
	let icon = $state("");
	let matchTemplate = $state("");
	let isLoading = $state(true);
	let isSubmitting = $state(false);
	let error = $state<string | null>(null);

	onMount(async () => {
		isLoading = true;
		try {
			const fetchedProvider = await loadProvider(providerId);
			if (fetchedProvider) {
				provider = fetchedProvider;
				label = fetchedProvider.label;
				icon = fetchedProvider.icon || "";
				matchTemplate = fetchedProvider.matchTemplate || "";
			} else {
				error = "Provider not found";
			}
		} catch (err) {
			error = err instanceof Error ? err.message : "Failed to load provider";
		} finally {
			isLoading = false;
		}
	});

	async function handleSubmit() {
		error = null;

		if (!label.trim()) {
			error = "Label is required";
			return;
		}

		isSubmitting = true;

		try {
			await updateProviderById(providerId, {
				label: label.trim(),
				icon: icon.trim() || undefined,
				matchTemplate: matchTemplate.trim() || undefined
			});

			goto(resolve("/providers"));
		} catch (err) {
			error = err instanceof Error ? err.message : "Failed to update provider";
		} finally {
			isSubmitting = false;
		}
	}

	function handleCancel() {
		goto(resolve("/providers"));
	}

	function handleRegexChange(regex: string) {
		matchTemplate = regex;
	}

	function handleIconError(errorMessage: string) {
		error = errorMessage;
	}
</script>

<div class="container mx-auto py-8 max-w-3xl">
	<div class="mb-6">
		<h1 class="text-3xl font-bold">Edit Provider</h1>
		<p class="text-muted-foreground mt-2">Update provider details</p>
	</div>

	{#if isLoading}
		<Card.Root>
			<Card.Content class="py-8">
				<p class="text-center text-muted-foreground">Loading provider...</p>
			</Card.Content>
		</Card.Root>
	{:else if error && !provider}
		<Card.Root>
			<Card.Content class="py-8">
				<p class="text-center text-red-600">{error}</p>
				<div class="flex justify-center mt-4">
					<Button onclick={() => goto(resolve("/providers"))}>
						Back to Providers
					</Button>
				</div>
			</Card.Content>
		</Card.Root>
	{:else}
		<Card.Root>
			<Card.Content class="pt-6">
				<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-6">
					<div class="space-y-2">
						<Label for="label">Label *</Label>
						<Input
							id="label"
							type="text"
							placeholder="e.g., PayPal, Venmo, Zelle"
							bind:value={label}
							required
						/>
					</div>

					<div class="space-y-2">
						<Label>Icon (optional)</Label>
						<Badge variant='outline' class="">
							<p>Current</p>
							<img src={provider?.icon} alt={provider?.label} class="w-5 h-4" />
						</Badge>

						<IconUploader bind:value={icon} onerror={handleIconError} />
					</div>

					<div class="space-y-2">
						<Label>Match Template (optional)</Label>
						<p class="text-sm text-muted-foreground mb-4">
							Define a regex pattern to automatically detect addresses for this provider
						</p>
						<RegexBuilder bind:value={matchTemplate} onchange={handleRegexChange} />
					</div>

					{#if error}
						<div class="p-3 bg-red-50 border border-red-200 rounded-md">
							<p class="text-sm text-red-600">{error}</p>
						</div>
					{/if}

					<div class="flex gap-3 justify-end">
						<Button
							type="button"
							variant="outline"
							onclick={handleCancel}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Saving..." : "Save Changes"}
						</Button>
					</div>
				</form>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
