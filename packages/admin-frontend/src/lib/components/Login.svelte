<script lang="ts">
	import { authService } from '$lib/services/auth.service';
	import { authState } from '$lib/state/auth.svelte';
	import Button from './ui/button/button.svelte';

	let isLoading = $state(false);
	let error = $state<string | null>(null);

	async function handleLogin() {
		isLoading = true;
		error = null;

		try {
			const token = await authService.login();
			authState.login(token);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Login failed';
			console.error('Login error:', err);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-background">
	<div class="w-full max-w-md space-y-8 p-8">
		<div class="text-center">
			<h1 class="text-3xl font-bold">Admin Login</h1>
			<p class="mt-2 text-muted-foreground">
				Sign in with your Nostr extension
			</p>
		</div>

		<div class="space-y-4">
			{#if error}
				<div class="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
					{error}
				</div>
			{/if}

			<Button
				onclick={handleLogin}
				disabled={isLoading}
                size="lg"
                class='w-full'

			>
				{#if isLoading}
					<span class="flex items-center justify-center gap-2">
						<svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Signing in...
					</span>
				{:else}
					Sign in with Nostr
				{/if}
			</Button>

			<div class="text-center text-sm text-muted-foreground">
				<p>Make sure you have a Nostr extension installed</p>
				<p class="mt-1">
					(e.g., <a href="https://getalby.com" target="_blank" rel="noopener noreferrer" class="underline hover:text-foreground">Alby</a> or 
					<a href="https://github.com/fiatjaf/nos2x" target="_blank" rel="noopener noreferrer" class="underline hover:text-foreground">nos2x</a>)
				</p>
			</div>
		</div>
	</div>
</div>
