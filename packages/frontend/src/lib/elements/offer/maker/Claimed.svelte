<script lang="ts">
	import type { Offer } from 'common/db/schema';

	interface Props {
		offer: Offer;
	}

	let { offer }: Props = $props();
</script>

<div>
	<p>Role: Maker</p>
	<p>State: {offer.status}</p>
</div>
