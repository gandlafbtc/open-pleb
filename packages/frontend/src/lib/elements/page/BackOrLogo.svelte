<script>
	import { page } from '$app/state';
	import { mode } from 'mode-watcher';
	import BackButton from './BackButton.svelte';


</script>
{#if page.url.pathname==="/"}
  			{#if mode.current === 'light'}
				<img src="/logo/logo-txt-black.svg" alt="OpenPleb Logo" class="h-8 w-auto" />
			{:else}
				<img src="/logo/logo-txt.svg" alt="OpenPleb Logo" class="h-8 w-auto" />
			{/if}
{:else}
        <BackButton></BackButton>
{/if}