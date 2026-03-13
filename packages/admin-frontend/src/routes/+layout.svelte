<script lang="ts">
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Login from '$lib/components/Login.svelte';
	import { authState } from '$lib/state/auth.svelte';
  import { Toaster } from "$lib/components/ui/sonner/index.js";
	let { children } = $props();
		function handleLogout() {
		authState.logout();
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<Toaster></Toaster>

{#if !authState.isAuthenticated}
	<Login />
{:else}
	<div class="min-h-screen bg-background p-8">
		<div class="mx-auto max-w-7xl">
			<div class="mb-8 flex items-center justify-between">
				<h1 class="text-3xl font-bold">OpenPleb Admin Dashboard</h1>
				<button
					onclick={handleLogout}
					class="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
				>
					Logout
				</button>
			</div>

			{@render children()}
			<div style="display:none">
				{#each locales as locale}
					<a href={localizeHref(page.url.pathname, { locale })}>
						{locale}
					</a>
				{/each}
			</div>
		</div>
	</div>
{/if}