<script>
	import { goto } from "$app/navigation";
	import Button from "$lib/components/ui/button/button.svelte";
	import DisplaySeed from "$lib/elements/onboarding/idcreation/DisplaySeed.svelte";
	import { seedPhrase } from "$lib/state/persistent/db/repos/seedPhrase";
	import { copyTextToClipboard } from "$lib/utils";
    let isDisplay = $state(false)

</script>
<div class="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-8">
	<div class="flex w-full max-w-md flex-col items-center space-y-8">
		<div class="max-w-2xl">
			<DisplaySeed bind:isDisplay></DisplaySeed>
		</div>

		<div class="flex w-full flex-col space-y-5">
			<Button disabled={!isDisplay} onclick={()=> {goto('/id/npub')}} size="lg">
				I have stored it securely
			</Button>

			<Button variant="link" disabled={!isDisplay} onclick={()=>copyTextToClipboard(seedPhrase.data[0]?.seedPhrase??"")} size="lg">
				dangerously copy
			</Button>
		</div>
	</div>
</div>
