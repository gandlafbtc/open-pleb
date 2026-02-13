<script>
	import { goto } from "$app/navigation";
	import Button from "$lib/components/ui/button/button.svelte";
	import DisplaySeed from "$lib/elements/onboarding/idcreation/DisplaySeed.svelte";
	import { seedPhrase } from "$lib/state/persistent/db/repos/seedPhrase";
	import { copyTextToClipboard } from "$lib/utils";
    let isDisplay = $state(false)

</script>
<div class="w-full flex items-center gap-10 flex-col">

    <div class="max-w-2xl">
        <DisplaySeed bind:isDisplay></DisplaySeed>
    </div>

    <div class="flex gap-2 justify-between w-full">

        <Button variant="link" onclick={()=>copyTextToClipboard(seedPhrase.data[0]?.seedPhrase??"")}>
            dangerously copy
        </Button>
        <Button disabled={!isDisplay} onclick={()=> {goto('/id/npub')}}>
            I have stored it securely
        </Button>
    </div>
</div>