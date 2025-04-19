<script>
	import Button from '$lib/components/ui/button/button.svelte';
	import EarnPage from '$lib/elements/pages/EarnPage.svelte';
	import PayPage from '$lib/elements/pages/PayPage.svelte';
	import { appMode } from '$lib/stores/local/mode';
</script>

{#if $appMode === 'pay'}
	<PayPage></PayPage>
{:else if $appMode === "earn"}
	<EarnPage></EarnPage>
  
{/if}