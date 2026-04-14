<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
	import * as Table from "$lib/components/ui/table";
	import { providersState } from "$lib/state/providers.svelte";
	import { loadProviders, deleteProviderById } from "$lib/services/provider.service";

	onMount(async () => {
		await loadProviders();
	});

	async function handleDelete(id: number) {
		if (!confirm("Are you sure you want to delete this provider?")) {
			return;
		}

		try {
			await deleteProviderById(id);
			await loadProviders();
		} catch (error) {
			alert("Failed to delete provider");
		}
	}

	function handleEdit(id: number) {
		goto(`/providers/${id}`);
	}

	function handleView(id: number) {
		goto(`/providers/${id}`);
	}
</script>

<div class="container mx-auto py-8">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-3xl font-bold">Providers</h1>
		<Button onclick={() => goto("/providers/new")}>
			Add Provider
		</Button>
	</div>

	{#if providersState.isLoading}
		<Card.Root>
			<Card.Content class="py-8">
				<p class="text-center text-muted-foreground">Loading providers...</p>
			</Card.Content>
		</Card.Root>
	{:else if providersState.error}
		<Card.Root>
			<Card.Content class="py-8">
				<p class="text-center text-red-600">{providersState.error}</p>
			</Card.Content>
		</Card.Root>
	{:else if providersState.providers.length === 0}
		<Card.Root>
			<Card.Content class="py-8">
				<p class="text-center text-muted-foreground">No providers found. Create one to get started.</p>
			</Card.Content>
		</Card.Root>
	{:else}
		<Card.Root>
			<Card.Content class="p-0">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>ID</Table.Head>
							<Table.Head>Label</Table.Head>
							<Table.Head>Icon</Table.Head>
							<Table.Head>Match Template</Table.Head>
							<Table.Head class="text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each providersState.providers as provider (provider.id)}
							<Table.Row class="cursor-pointer hover:bg-muted/50" onclick={() => handleView(provider.id)}>
								<Table.Cell class="font-medium">{provider.id}</Table.Cell>
								<Table.Cell>{provider.label}</Table.Cell>
								<Table.Cell>
									{#if provider.icon && provider.icon.startsWith('data:')}
										<img src={provider.icon} alt={provider.label} class="w-8 h-8" />
									{:else if provider.icon}
										{provider.icon}
									{:else}
										—
									{/if}
								</Table.Cell>
								<Table.Cell class="font-mono text-xs max-w-md truncate">
									{provider.matchTemplate || "—"}
								</Table.Cell>
								<Table.Cell class="text-right">
									<div class="flex justify-end gap-2" onclick={(e) => e.stopPropagation()}>
										<Button
											variant="outline"
											size="sm"
											onclick={() => handleEdit(provider.id)}
										>
											Edit
										</Button>
										<Button
											variant="destructive"
											size="sm"
											onclick={() => handleDelete(provider.id)}
										>
											Delete
										</Button>
									</div>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
