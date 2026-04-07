<script>
	import { page } from '$app/state';
	import { mode } from 'mode-watcher';
	import BackButton from './BackButton.svelte';


</script>
{#if page.url.pathname==="/"}
  			{#if mode.current === 'light'}
				<img src="/logo/logo-mark-black.svg" alt="OpenPleb Logo" class="h-8 w-auto sm:hidden" />
				<img src="/logo/logo-txt-black.svg" alt="OpenPleb Logo" class="h-8 w-auto hidden sm:block" />
			{:else}
				<img src="/logo/logo-mark.svg" alt="OpenPleb Logo" class="h-8 w-auto sm:hidden" />
				<img src="/logo/logo-txt.svg" alt="OpenPleb Logo" class="h-8 w-auto hidden sm:block" />
			{/if}
{:else}
        <BackButton></BackButton>
{/if}