<script lang="ts">
	import * as Drawer from '$lib/components/ui/drawer';
	import Button from '$lib/components/ui/button/button.svelte';
	import { offerFilterState } from '$lib/state/persistent/local/offerFilter.svelte';
	import { providerState } from '$lib/state/dynamic/provider.svelte';
	import { X } from '@lucide/svelte';

	interface Props {
		open: boolean;
		onOpenChange: (open: boolean) => void;
	}

	let { open = $bindable(), onOpenChange }: Props = $props();

	const providers = $derived(providerState.providers);
	const selectedIds = $derived(offerFilterState.selectedProviderIds);

	function toggleProvider(id: number) {
		offerFilterState.toggleProvider(id);
	}

	function clearAllFilters() {
		offerFilterState.clearFilters();
	}
</script>

<Drawer.Root {open} onOpenChange={(o) => onOpenChange(o)}>
	<Drawer.Content>
		<div class="mx-auto w-full max-w-sm">
			<Drawer.Header>
				<Drawer.Title>Filter Offers</Drawer.Title>
				<Drawer.Description>Select providers to filter offers</Drawer.Description>
			</Drawer.Header>
					<Button disabled={!offerFilterState.hasActiveFilters()} variant="ghost" onclick={clearAllFilters} class="w-full">
						<X class="mr-2 h-3 w-3" />
						<p class="text-sm">

                            Clear All Filters
                        </p>
					</Button>
			<div class="p-4">
				<!-- Provider Filters -->
				<div class="space-y-3">
					<h3 class="text-sm font-medium">Providers</h3>
					<div class="space-y-2">
						{#each providers as provider (provider.id)}
							<label class="flex items-center gap-3 rounded-lg border p-3 hover:bg-primary/20">
								<input
									type="checkbox"
									checked={selectedIds.includes(provider.id)}
									onchange={() => toggleProvider(provider.id)}
									class="h-4 w-4 rounded border-gray-300"
								/>
								{#if provider.icon}
									<img src={provider.icon} alt={provider.label} class="h-6 w-6 rounded" />
								{/if}
								<span class="flex-1 text-sm">{provider.label}</span>
							</label>
						{/each}
					</div>
				</div>
			</div>

			<Drawer.Footer>

				<Drawer.Close>Ok</Drawer.Close
        >
			</Drawer.Footer>
		</div>
	</Drawer.Content>
</Drawer.Root>
