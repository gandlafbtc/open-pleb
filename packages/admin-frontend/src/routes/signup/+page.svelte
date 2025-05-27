<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import FormButton from '$lib/components/ui/form/form-button.svelte';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { LoaderCircle, LogIn } from 'lucide-svelte';
	import { ensureError } from '$lib/errors';
	import { userLoggedIn } from '$lib/stores/user';

	let username = $state('');
	let password = $state('');
	let passwordRepeat = $state('');

	let isLoading = $state(false);

	const signup = async () => {
		if (password.length < 12) {
			toast.warning('Password must be 12 characters or longer');
			return;
		}
		if (password !== passwordRepeat) {
			toast.warning('Passwords do not match');
			return;
		}
		try {
			isLoading = true;
			const data = await userLoggedIn.signup(username, password)
            toast.success(data.message)
            goto('/')
		} catch (error) {
            console.error(error)
            const err = ensureError(error)
            toast.error(err.message)
		} finally {
			isLoading = false;
		}
	};
</script>

<div class="flex h-screen w-full items-center justify-center">
	<Card.Root class="w-80">
		<form onsubmit={signup}>
			<Card.Header>
				<Card.Title>Signup</Card.Title>
				<Card.Description>Enter your login information.</Card.Description>
			</Card.Header>
			<Card.Content class="space-y-2">
				<div class="space-y-1">
					<Label for="name">Username</Label>
					<Input disabled={isLoading} bind:value={username} required id="name" placeholder="MNT" />
				</div>
				<div class="space-y-1">
					<Label for="username">Password</Label>
					<Input disabled={isLoading} bind:value={password} required type="password" placeholder="*********" />
				</div>
				<div class="space-y-1">
					<Label for="username">Repeat password</Label>
					<Input disabled={isLoading} bind:value={passwordRepeat} required type="password" placeholder="*********" />
				</div>
			</Card.Content>
			<Card.Footer class="flex items-center justify-between gap-2">
				<a href="/login" class="text-sm underline"> Login </a>
				<FormButton disabled={isLoading} type="submit">
				
					{#if isLoading}
					  <LoaderCircle class='animate-spin'></LoaderCircle>
					{:else}
					  <LogIn></LogIn>
					{/if}
					Sign up
				</FormButton>
			</Card.Footer>
		</form>
	</Card.Root>
</div>
