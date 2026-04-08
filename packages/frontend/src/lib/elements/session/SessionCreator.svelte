<script lang="ts">
	import { blindSessionService } from '$lib/interface/rest/blindSession.service';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { CocoWallet } from '$lib/state/wallet/wallet.svelte';
	import { Button } from '$lib/components/ui/button';

	interface Props {
		role: 'maker' | 'taker';
		onSuccess?: () => void;
		onError?: (error: Error) => void;
		buttonText?: string;
		buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
		buttonClass?: string;
	}

	let {
		role,
		onSuccess,
		onError,
		buttonText = 'Open Session',
		buttonVariant = 'default',
		buttonClass = ''
	}: Props = $props();

	let wallet: CocoWallet | undefined = $state(undefined);
	let isLoading = $state(false);

	onMount(async () => {
		const { wallet: w } = await import('$lib/state/wallet/wallet.svelte');
		wallet = w;
	});

	async function createSession() {
		if (!wallet) {
			toast.error('Wallet not initialized');
			return;
		}

		isLoading = true;
		try {
			// Consume a BAT from the wallet
			const authProof = await wallet.consumeBat();
			
			if (!authProof) {
				toast.error('No BAT available. Please top up your BAT balance.');
				return;
			}

			// Open session with the consumed BAT
			await blindSessionService.openSession(role, authProof);
			
			// Call success callback if provided
			if (onSuccess) {
				onSuccess();
			}
		} catch (error) {
			const err = error instanceof Error ? error : new Error('Failed to open blind session');
			toast.error(err.message);
			console.error(error);
			
			// Call error callback if provided
			if (onError) {
				onError(err);
			}
		} finally {
			isLoading = false;
		}
	}
</script>

<Button
	onclick={createSession}
	disabled={isLoading}
	variant={buttonVariant}
	class={buttonClass}
>
	{isLoading ? 'Opening Session...' : buttonText}
</Button>
