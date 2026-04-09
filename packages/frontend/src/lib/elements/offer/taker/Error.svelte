<script lang="ts">
	import type { Offer } from 'common/db/schema';

	interface Props {
		offer: Offer;
	}

	let { offer }: Props = $props();
</script>

<div class="text-center py-4 space-y-2">
	<p class="text-sm text-destructive">An error occurred with this offer.</p>
	<p class="text-xs text-muted-foreground">Status: {offer.status}</p>
</div>
