<script lang="ts">
	import { Badge } from "$lib/components/ui/badge";
	import { UserMinus, UserPlus} from "@lucide/svelte";
	
	// Placeholder values for online makers and takers
	// These will be replaced with actual logic later
	let onlineMakers = $state(0);
	let onlineTakers = $state(0);
</script>

<div class="container mx-auto p-2 pt-0">
		<!-- Online Status Badges -->
		<div class="flex flex-wrap gap-4 items-center justify-center">
			<Badge variant="outline" class="px-4 py-2 text-sm flex items-center gap-2">
				<UserPlus class="w-4 h-4" />
				<span class="font-semibold">Makers</span>
				<span class="relative flex h-2 w-2">
					{#if onlineMakers > 0}
						<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
						<span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
					{:else}
						<span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
					{/if}
				</span>
				<span>{onlineMakers}</span>
			</Badge>
			
			<Badge variant="outline" class="px-4 py-2 text-sm flex items-center gap-2">
				<UserMinus class="w-4 h-4" />
				<span class="font-semibold">Takers</span>
				<span class="relative flex h-2 w-2">
					{#if onlineTakers > 0}
						<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
						<span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
					{:else}
						<span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
					{/if}
				</span>
				<span>{onlineTakers}</span>
			</Badge>
		</div>
</div>