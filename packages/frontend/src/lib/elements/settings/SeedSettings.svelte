<script>
	import Button from "$lib/components/ui/button/button.svelte";
	import { seedPhrase } from "$lib/state/persistent/db/repos/seedPhrase";
	import { copyTextToClipboard } from "$lib/utils";
	import DisplaySeed from "../onboarding/idcreation/DisplaySeed.svelte";
    let isDisplay = $state(false)

</script>
<DisplaySeed bind:isDisplay></DisplaySeed>
			<Button disabled={!isDisplay} variant="link" onclick={()=>copyTextToClipboard(seedPhrase.data[0]?.seedPhrase??"")} size="lg">
				dangerously copy
			</Button>