<script lang="ts">
	import type { Offer } from 'common/db/schema';

	interface Props {
		offer: Offer;
	}

	let { offer }: Props = $props();
</script>

<div class="text-center py-4 space-y-2">
	<p class="text-sm text-muted-foreground">Invoice has been paid by the taker.</p>
	<p class="text-sm font-semibold">Waiting for taker to claim the offer.</p>
</div>
