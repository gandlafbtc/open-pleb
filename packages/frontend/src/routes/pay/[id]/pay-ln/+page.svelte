<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { PUBLIC_API_VERSION, PUBLIC_BACKEND_URL } from '$env/static/public';
	import CopiableToken from '$lib/elements/CopiableToken.svelte';
	import { dataStore } from '$lib/stores/session/data.svelte';
	import { LoaderCircle } from 'lucide-svelte';
	import { decode } from 'light-bolt11-decoder';
	import { encodeQR } from 'qr';
	import { onMount } from 'svelte';
	import { formatCurrency } from '$lib/helper';
	import Expiry from '$lib/elements/Expiry.svelte';
	const id = Number.parseInt(page.params.id);
	const offer = $derived(dataStore.offers.find((o) => o.id === id));
	$inspect(offer);
	onMount(() => {
		const interval = setInterval(async () => {
			if (!offer) {
				return;
			}
			//TODO instead of polling, do this with websockets
			const res = await fetch(
				`${PUBLIC_BACKEND_URL}/api/${PUBLIC_API_VERSION}/offers/${offer.id}/checkpaidinvoice`
			);
			const data = await res.json();

			if (data.state === 'PAID' || data.state === 'ISSUED') {
				clearInterval(interval);
				goto(`/pay/${offer.id}/receipt`);
			}
		}, 5000);
		return () => clearInterval(interval);
	});
</script>

{#if offer?.invoice}
	<Expiry {offer}></Expiry>
	<div class="flex w-80 flex-col gap-2">
		<div class=" flex w-full flex-col items-center justify-center gap-2">
			<p class="text-xl font-bold">Step 3: Pay Invoice</p>
			<p>
				{formatCurrency(Math.ceil(decode(offer.invoice).sections[2].value / 1000), 'SAT')}
			</p>
		</div>
		<a href="lightning:{offer.invoice}">
			<div class="w-full rounded-md border p-2">
				{@html encodeQR(offer?.invoice, 'svg')}
			</div>
		</a>
		<CopiableToken token={offer?.invoice}></CopiableToken>
	</div>
{:else}
	<LoaderCircle class="animate-spin"></LoaderCircle>
{/if}
