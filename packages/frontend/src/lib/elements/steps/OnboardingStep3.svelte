<script lang="ts">
	interface Props {
		onFinish: () => void;
		onBack: () => void;
	}

	let { onFinish, onBack }: Props = $props();

	const steps = [
		{
			title: 'Create a Wallet',
			description: 'Set up your Bitcoin wallet to start using OpenPleb.'
		},
		{
			title: 'Connect to Earners',
			description: 'Browse and connect with earners who can fulfill your payment requests.'
		},
		{
			title: 'Make Payments',
			description: 'Pay any QR code or money address with Bitcoin through connected earners.'
		},
		{
			title: 'Earn Bitcoin',
			description: 'Become an earner yourself and fulfill transactions for others.'
		}
	];
</script>

<div class="flex flex-1 flex-col items-center justify-center px-6 pb-32">
	<div class="max-w-2xl">
		<h1 class="mb-12 text-6xl font-bold md:text-7xl">How it works</h1>

		<ol class="space-y-6 text-lg md:text-xl">
			{#each steps as step, index}
				<li class="flex gap-3">
					<span class="text-muted-foreground">{index + 1}.</span>
					<div>
						<span class="font-medium">{step.title} :</span>
						<span class="text-muted-foreground">{step.description}</span>
					</div>
				</li>
			{/each}
		</ol>
	</div>
</div>
