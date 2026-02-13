<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { validateMnemonic } from '@scure/bip39';
	import { wordlist } from '@scure/bip39/wordlists/english.js';
	import { toast } from 'svelte-sonner';
	let restoreSeed: Array<string> = $state(new Array(12));
	let seedString: string = $state('');

	let isRestoreWallet = $state(false);

	const populateSeed = () => {
		setTimeout(() => {
			const seedStringCopy = seedString;
			seedString = '';
			const splitted = seedStringCopy.split(' ');
			if (splitted.length !== 12) {
				toast.warning('The seed phrase must be 12 words');
				return;
			}
			if (!validateMnemonic(seedStringCopy, wordlist)) {
				toast.warning('Invalid seed phrase');
				return;
			}
			restoreSeed = splitted;
		}, 100);
	};
</script>

<div class="flex flex-col gap-2">
	<Label>
		<Checkbox bind:checked={isRestoreWallet}></Checkbox>
		<p class="font-bold">Also restore wallet</p>                                         

		<p class="text-sm text-muted-foreground">Will try to restore wallet funds</p>
	</Label>
</div>

<div class="grid grid-cols-2 grid-flow-col grid-rows-6 gap-3">
	{#each restoreSeed as input, i}
		<div class="flex items-center gap-1">
			<p class="w-8">{i + 1}.</p>
			<Input type="text" class="input input-sm grow" bind:value={restoreSeed[i]} />
		</div>
	{/each}
</div>
<Input
	class="grow"
	type="text"
	placeholder="...or dangerously paste seed here"
	onpaste={populateSeed}
	bind:value={seedString}
	onkeydown={(e) => {}}
/>
<Button class="w-full">Restore ID {isRestoreWallet?" + Wallet": ""}</Button>
