<script lang="ts">
	import type { Offer } from "@openPleb/common/db/schema";

    interface Props {offer: Offer}
    
    let {offer}: Props = $props();
</script>

<p>
    {offer?.status} Waiting for offer to be paid.
</p>