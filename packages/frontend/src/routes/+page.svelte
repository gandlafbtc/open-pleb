<script>
	import ExchangeRateInfo from "$lib/elements/page/ExchangeRateInfo.svelte";
	import OnlineBadges from "$lib/elements/page/OnlineBadges.svelte";
	import CreateOfferButton from "$lib/elements/page/CreateOfferButton.svelte";
	import OffersList from "$lib/components/offers/OffersList.svelte";
	import { SlidersVertical } from "@lucide/svelte";
</script>


<OnlineBadges></OnlineBadges>
<ExchangeRateInfo></ExchangeRateInfo>
<CreateOfferButton></CreateOfferButton>

<div class="mt-6 flex flex-col gap-2">
	<div class="flex gap-2 justify-between items-center">
		<h1 class="font-bold">
			Offers to claim
		</h1>
		<SlidersVertical class="h-4 w-4"></SlidersVertical>
	</div>
	<OffersList />
</div>
