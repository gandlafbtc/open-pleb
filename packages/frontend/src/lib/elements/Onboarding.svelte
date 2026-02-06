<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { localstore } from '$lib/state/persistent/local/localstore.svelte';
	import { mode } from 'mode-watcher';
	import DarkmodeToggle from '$lib/components/ui/custom/DarkmodeToggle.svelte';
	import LanguageSelector from '$lib/components/ui/custom/LanguageSelector.svelte';
	import OnboardingStep1 from './steps/OnboardingStep1.svelte';
	import OnboardingStep2 from './steps/OnboardingStep2.svelte';
	import OnboardingStep3 from './steps/OnboardingStep3.svelte';
	import { ArrowLeft } from '@lucide/svelte';

	let currentStep = $state(1);
	const totalSteps = 3;

	function handleSkip() {
		localstore.isOnboarded = true;
	}

	function handleNext() {
		if (currentStep < totalSteps) {
			currentStep++;
		}
	}

	function handleBack() {
		if (currentStep > 1) {
			currentStep--;
		}
	}

	function handleFinish() {
		localstore.isOnboarded = true;
	}

	// Determine button text based on current step
	const nextButtonText = $derived(currentStep === totalSteps ? 'Ready to create wallet?' : 'Next');
	const showBackButton = $derived(currentStep > 1);
</script>

<div class="flex min-h-screen flex-col bg-background">
	<!-- Header -->
	<header class="flex items-center justify-between p-6">
		<div class="flex items-center gap-3">
			{#if mode.current === 'light'}
				<img src="/logo/logo-txt-black.svg" alt="OpenPleb Logo" class="h-8 w-auto" />
			{:else}
				<img src="/logo/logo-txt.svg" alt="OpenPleb Logo" class="h-8 w-auto" />
			{/if}
			<DarkmodeToggle></DarkmodeToggle>
		</div>
		<LanguageSelector />
	</header>

	<!-- Main Content - Step Components -->
	<main class="flex flex-1 flex-col">
		{#if currentStep === 1}
			<OnboardingStep1 onNext={handleNext} onSkip={handleSkip} />
		{:else if currentStep === 2}
			<OnboardingStep2 onNext={handleNext} onBack={handleBack} />
		{:else if currentStep === 3}
			<OnboardingStep3 onFinish={handleFinish} onBack={handleBack} />
		{/if}
	</main>

	<!-- Footer Buttons -->
	<footer class="flex justify-between gap-4 p-6">
		{#if showBackButton}
			<Button
				variant="outline"
				size="lg"
				class="flex items-center gap-2 rounded-xl"
				onclick={handleBack}
			>
				<ArrowLeft class="h-5 w-5" />
			</Button>
		{:else}
			<Button variant="outline" size="lg" class="flex-1  text-lg" onclick={handleSkip}>
				Skip
			</Button>
		{/if}
		<Button
			size="lg"
			class="flex-1 bg-primary text-lg font-semibold"
			onclick={currentStep === totalSteps ? handleFinish : handleNext}
		>
			{nextButtonText}
		</Button>
	</footer>
</div>
