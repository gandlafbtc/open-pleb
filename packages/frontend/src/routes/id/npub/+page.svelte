<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { idKeys } from '$lib/state/dynamic/id.svelte';
	import { Copy, Loader2, LoaderCircle, CheckCircleIcon } from '@lucide/svelte';
	import { encodeQR } from 'qr';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { copyTextToClipboard } from '$lib/utils';
	import { ensureError } from 'common/errors';
	import { registerUser, checkUserStatus } from '$lib/interface/rest/user.service';
	import QR from '$lib/elements/qr/QR.svelte';

	let isRegistering = $state(false);
	let isConnecting = $state(false);
	let registrationStatus: 'idle' | 'registered' | 'error' = $state('idle');
	let inviteCode = $state('');

	const handleRegister = async () => {
		if (!idKeys.pubkey || !idKeys.privkey) {
			toast.error('ID keys not available');
			return;
		}

		if (!inviteCode) {
			toast.warning('No invite code provided');
			return;
		}

		isRegistering = true;

		try {
			await registerUser(idKeys.getHexPubKey(), inviteCode);

			registrationStatus = 'registered';
			toast.success('Successfully registered your Open Pleb ID!');

			// Redirect to main page after successful registration
			goto('/');
		} catch (error) {
			console.error('Registration error:', error);
			registrationStatus = 'error';
			toast.error(error instanceof Error ? error.message : 'Failed to register ID');
		} finally {
			isRegistering = false;
		}
	};

	const handleConnect = async () => {
		if (!idKeys.pubkey) {
			toast.error('ID keys not available');
			return;
		}

		isConnecting = true;

		try {
			const status = await checkUserStatus(idKeys.getHexPubKey());
			if (!status.isInvited) {
				throw new Error('ID is not yet invited. Register with invite code.');
			}
			toast.success('Welcome back!');
			goto('/');
		} catch (error) {
			const err = ensureError(error);
			console.error('Connection error:', error);
			toast.error(err.message);
		} finally {
			isConnecting = false;
		}
	};
</script>

{#if idKeys.pubkey}
	<div class="flex flex-col items-center justify-center min-h-screen p-6 space-y-8">
		<!-- Success Message -->
		<div class="text-center space-y-2">
			<h1 class="text-3xl font-bold">Your Open Pleb ID Has Been Created!</h1>
			<p class="text-muted-foreground max-w-md">
				Your unique identifier has been generated. You can now register it with an Open Pleb
				instance or connect if you've already registered.
			</p>
		</div>

		<!-- QR Code and npub Display -->
		<div class="flex flex-col items-center space-y-4">
			<div class="w-64 bg-white rounded-lg p-4 shadow-lg">
				<QR data={idKeys.getNpub()}></QR>
			</div>

			<div class="flex items-center gap-2 bg-muted p-3 rounded-lg max-w-md">
				<code class="text-sm break-all flex-1">{idKeys.getNpub()}</code>
				<Button
					variant="ghost"
					size="icon"
					onclick={()=>copyTextToClipboard(idKeys.getNpub())}
					class="flex-shrink-0"
				>
						<Copy class="w-4 h-4" />
				</Button>
			</div>
		</div>

		<!-- Invite Code Input -->
		<div class="w-full max-w-md space-y-2">
			<label for="inviteCode" class="text-sm font-medium">
				Invite Code
			</label>
			<input
				id="inviteCode"
				type="text"
				bind:value={inviteCode}
				placeholder="Enter invite code if you have one"
				disabled={isRegistering || isConnecting || registrationStatus === 'registered'}
				class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
			/>
		</div>

		<!-- Action Buttons -->
		<div class="flex flex-col gap-8 w-full max-w-md">
			{#if inviteCode}
			  
			<Button
			onclick={handleRegister}
			disabled={isRegistering || isConnecting || registrationStatus === 'registered'}
			class="flex-1"
			>
			{#if isRegistering}
			<LoaderCircle class="w-4 h-4 mr-2 animate-spin" />
			Registering...
			{:else if registrationStatus === 'registered'}
			<CheckCircleIcon class="w-4 h-4 mr-2" />
			Registered
			{:else}
			Register ID
			{/if}
		</Button>
		{:else}
		  
		<Button
		variant="link"
		onclick={handleConnect}
		disabled={isRegistering || isConnecting || registrationStatus === 'registered'}
		class="flex-1"
		>
		{#if isConnecting}
		<Loader2 class="w-4 h-4 mr-2 animate-spin" />
		Connecting...
		{:else}
		Connect as Existing ID
		{/if}
	</Button>
	{/if}

		</div>

	</div>
{:else}
	<div class="flex items-center justify-center min-h-screen">
		<div class="text-center space-y-4">
			<Loader2 class="w-12 h-12 animate-spin mx-auto text-primary" />
			<p class="text-muted-foreground">Loading your ID...</p>
		</div>
	</div>
{/if}
