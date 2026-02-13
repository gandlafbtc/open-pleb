<script lang="ts">
	import Checkbox from "$lib/components/ui/checkbox/checkbox.svelte";
	import Input from "$lib/components/ui/input/input.svelte";
	import Label from "$lib/components/ui/label/label.svelte";
	import { seedPhrase } from "$lib/state/persistent/db/repos/seedPhrase";

    const words = seedPhrase.data[0]?.seedPhrase.split(" ")
    interface Props {isDisplay?: boolean}
    
    let {isDisplay = $bindable(false)}: Props = $props();
</script>

<div class="flex flex-col gap-5 items-center">
    <h1 class="font-bold text-2xl">
        Seed phrase
    </h1>
    <p class="text-muted-foreground">
        This seedPhrase phrase is the backup to your OpenPleb ID and your wallet. Store it securely.
    </p>
    <p class="text-muted-foreground">
        If you lose this seedPhrase phrase, noone can help you restore your OpenPleb ID or your wallet.
    </p>
    
    <Label>
        <Checkbox bind:checked={isDisplay}>
            
        </Checkbox>
        <p>I understand, show me the seedPhrase phrase</p>
    </Label>

    <div class="grid grid-cols-2 grid-flow-col grid-rows-6 gap-3">
        {#each words as word, i}
		<div class="flex items-center gap-1">
            <p class="w-8">{i + 1}.</p>
			<Input type="text" class="input input-sm grow" value={isDisplay?word:"******"} />
		</div>
        {/each}
    </div>
</div>