<script lang="ts">
	import { PUBLIC_HOSTED_BY } from '$env/static/public';
	import Badge from '$lib/components/ui/badge/badge.svelte';

	interface Props {
		onNext: () => void;
		onSkip: () => void;
	}

	let { onNext, onSkip }: Props = $props();
</script>

<div class="flex flex-1 flex-col items-center justify-center px-6 pb-32">
	<div class="max-w-2xl text-center">
		<h1 class="mb-8 text-6xl font-bold leading-tight md:text-7xl">
			What is<br />OpenPleb?
		</h1>
		<p class="text-lg text-muted-foreground md:text-xl">
			OpenPleb is a community hosted platform, that enables users to pay any QR or money address
			with Bitcoin, by connecting them to earners that fulfill transactions in exchange for Bitcoin.
		</p>

		<div class="flex flex-col items-center gap-2 pt-5">
			<p class="text-muted-foreground">This instance is hosted by</p>
			<Badge variant="outline">{PUBLIC_HOSTED_BY}</Badge>
		</div>
	</div>
</div>
