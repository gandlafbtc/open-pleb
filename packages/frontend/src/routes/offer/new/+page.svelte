<script lang="ts">
	import CreateOfferForm from '$lib/elements/offer/CreateOfferForm.svelte';
	import ExchangeRateInfo from '$lib/elements/page/ExchangeRateInfo.svelte';
	import { blindSessionState } from '$lib/state/dynamic/blindSession.svelte';
	import { offerStore } from '$lib/state/persistent/db/repos/offer';
	import { blindSessionService } from '$lib/interface/rest/blindSession.service';
	import { goto } from '$app/navigation';
	import * as Alert from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { AlertCircle } from '@lucide/svelte';
	import { resolve } from '$app/paths';

	let showPreview = $state(false);
	let isClosingSession = $state(false);

	// Check if there's an active session and find the associated offer
	const activeSession = $derived(blindSessionState.currentSession);
	const hasActiveSession = $derived(blindSessionState.isActive);
	
	const activeOffer = $derived(() => {
		if (!activeSession || !hasActiveSession) return null;
		
		const offers = offerStore.data;
		return offers.find(offer => 
			offer.makerSessionId === activeSession.sessionId || 
			offer.takerSessionId === activeSession.sessionId
		);
	});

	async function handleCloseSession() {
		isClosingSession = true;
		try {
			await blindSessionService.closeSession();
		} finally {
			isClosingSession = false;
		}
	}

	function handleGoToOffer() {
		const offer = activeOffer();
		if (offer) {
			goto(resolve(`/offer/${offer.id}`));
		}
	}
</script>

<div class="container mx-auto">
	{#if hasActiveSession && activeOffer()}
		<Alert.Root variant="default" class="mb-6">
			<AlertCircle class="h-4 w-4" />
			<Alert.Title>Active Session Detected</Alert.Title>
			<Alert.Description>
				There is already an active session for this offer. You can navigate to the active offer or close the session to create a new one.
			</Alert.Description>
			<div class="mt-4 flex gap-3">
				<Button onclick={handleGoToOffer} variant="default">
					Go to Active Offer
				</Button>
				<Button 
					onclick={handleCloseSession} 
					variant="outline"
					disabled={isClosingSession}
				>
					{isClosingSession ? 'Closing...' : 'Close Session'}
				</Button>
			</div>
		</Alert.Root>
	{:else}
		{#if !showPreview}
			<ExchangeRateInfo/>
		{/if}
		<CreateOfferForm bind:showPreview />
	{/if}
</div>
