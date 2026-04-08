<script lang="ts">
	import { Plus } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
</script>

<div class="fixed bottom-4 right-4 z-50">
	<Button
		onclick={()=>goto(resolve("/offer/new"))}
		size="icon-lg"
		class="h-14 w-14 rounded-full shadow-lg transition-shadow hover:shadow-xl"
		aria-label="Create offer"
	>
		<Plus class="h-6 w-6" />
	</Button>
</div>
