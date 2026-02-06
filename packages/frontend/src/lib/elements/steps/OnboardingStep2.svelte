<script lang="ts">
	interface Props {
		onNext: () => void;
		onBack: () => void;
	}

	let { onNext, onBack }: Props = $props();

	const benefits = [
		{
			title: 'Bonds',
			description: 'Lorem ipsum dolor sit amet consectetur.'
		},
		{
			title: 'Earn in Bitcoin',
			description: 'Lorem ipsum dolor sit amet consectetur.'
		},
		{
			title: 'Ierom',
			description: 'Lorem ipsum dolor sit amet consectetur.'
		},
		{
			title: 'epsium',
			description: 'Lorem ipsum dolor sit amet consectetur.'
		}
	];
</script>

<div class="flex flex-1 flex-col items-center justify-center px-6 pb-32">
	<div class="max-w-2xl">
		<h1 class="mb-12 text-6xl font-bold md:text-7xl">Benefits</h1>

		<ol class="space-y-6 text-lg md:text-xl">
			{#each benefits as benefit, index}
				<li class="flex gap-3">
					<span class="text-muted-foreground">{index + 1}.</span>
					<div>
						<span class="font-medium">{benefit.title} :</span>
						<span class="text-muted-foreground">{benefit.description}</span>
					</div>
				</li>
			{/each}
		</ol>
	</div>
</div>
