<script lang="ts">
	import type { Offer } from "@openPleb/common/db/schema";

    interface Props {offer: Offer}
    
    let {offer}: Props = $props();
</script>

<p>
    Waiting for receipt... {offer?.status}
</p>