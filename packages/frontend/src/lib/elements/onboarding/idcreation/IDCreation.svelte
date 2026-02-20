<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { seedPhrase } from '$lib/state/persistent/db/repos/seedPhrase';
	import { delay } from 'common/util';
	import Restore from './Restore.svelte';
	import { initSeedAndKeys } from '$lib/app/init';

	let showRestoreScreen = $state(false);

	// Event handlers for the buttons
	const handleCreateID = async () => {
        goto('/id')
	};
	afterNavigate(async (n)=> {
		if (n.to?.url.pathname==="/id") {
			seedPhrase.generateNew()
			await initSeedAndKeys()
		}
	})
</script>

<div class="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-8">
	<div class="flex w-full max-w-md flex-col items-center space-y-8">
		{#if showRestoreScreen}
        <div class="flex flex-col gap-2">
            <h1 class="font-bold text-xl">
                Restore
            </h1>
            <h2>
                If you have created an OpenPleb ID before, you can use your 12-word backup phrase to restore it on this device.
            </h2>
            <p class="text-secondary">
                <span class="font-bold">Important!</span> Do not use the same identity on separate devices at the same time. 
            </p>
        </div>
        <Restore></Restore>
                        <Button variant='link' onclick={()=> showRestoreScreen=false}>
                    Back
                </Button>
        {:else}
			<div class="space-y-4 text-center">
				<h1 class="text-3xl font-semibold tracking-tight">OpenPleb ID</h1>
				<p class="text-sm text-muted-foreground">
					Create or restore a cryptographic ID to use OpenPleb
				</p>
			</div>

			<div class="flex w-full flex-col space-y-5">
				<Button onclick={handleCreateID} size="lg">Create new ID</Button>

				<Button
					onclick={() => {
						showRestoreScreen = true;
					}}
					variant="link"
					size="lg"
				>
					Restore ID
				</Button>
			</div>
		{/if}
	</div>
</div>
