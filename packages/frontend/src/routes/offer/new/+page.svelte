<script lang="ts">
	import CreateOfferForm from '$lib/elements/offer/CreateOfferForm.svelte';
	import ExchangeRateInfo from '$lib/elements/page/ExchangeRateInfo.svelte';

	let showPreview = $state(false);
</script>

<div class="container mx-auto">
	{#if !showPreview}
		<ExchangeRateInfo/>
	{/if}
	<CreateOfferForm bind:showPreview />
</div>
