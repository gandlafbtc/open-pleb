<script lang="ts">
	import { Badge } from "$lib/components/ui/badge";
	import { UserMinus, UserPlus} from "@lucide/svelte";
	import { sessionCountState } from "$lib/state/dynamic/sessionCount.svelte";
</script>

<div class="container mx-auto p-2 pt-0">
		<!-- Online Status Badges -->
		<div class="flex flex-wrap gap-4 items-center justify-center">
			<Badge variant="outline" class="px-4 py-2 text-sm flex items-center gap-2">
				<UserPlus class="w-4 h-4" />
				<span class="font-semibold">Makers</span>
				<span class="relative flex h-2 w-2">
					{#if sessionCountState.makerCount > 0}
						<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
						<span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
					{:else}
						<span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
					{/if}
				</span>
				<span>{sessionCountState.makerCount}</span>
			</Badge>
			
			<Badge variant="outline" class="px-4 py-2 text-sm flex items-center gap-2">
				<UserMinus class="w-4 h-4" />
				<span class="font-semibold">Takers</span>
				<span class="relative flex h-2 w-2">
					{#if sessionCountState.takerCount > 0}
						<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
						<span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
					{:else}
						<span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
					{/if}
				</span>
				<span>{sessionCountState.takerCount}</span>
			</Badge>
		</div>
</div>