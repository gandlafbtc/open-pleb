<script lang="ts">
	import { goto } from "$app/navigation";
	import { resolve } from "$app/paths";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import * as Card from "$lib/components/ui/card";
	import RegexBuilder from "$lib/components/RegexBuilder.svelte";
	import IconUploader from "$lib/components/IconUploader.svelte";
	import { saveProvider } from "$lib/services/provider.service";

	let label = $state("");
	let icon = $state("");
	let matchTemplate = $state("");
	let isSubmitting = $state(false);
	let error = $state<string | null>(null);

	async function handleSubmit() {
		error = null;

		if (!label.trim()) {
			error = "Label is required";
			return;
		}

		isSubmitting = true;

		try {
			await saveProvider({
				label: label.trim(),
				icon: icon.trim(),
				matchTemplate: matchTemplate.trim() || undefined
			});

			goto(resolve("/providers"));
		} catch (err) {
			error = err instanceof Error ? err.message : "Failed to create provider";
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
		<h1 class="text-3xl font-bold">Add New Provider</h1>
		<p class="text-muted-foreground mt-2">Create a new fiat payment provider</p>
	</div>

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
						{isSubmitting ? "Creating..." : "Create Provider"}
					</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
