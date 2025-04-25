<script lang="ts">
	import { onMount } from 'svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Button from '$lib/components/ui/button';
	import { Bell, X, CheckCircle2, AlertTriangle } from 'lucide-svelte';
	import { appMode } from '$lib/stores/local/mode';
	import { base64ToUint8Array } from '$lib/helper';
	import { env } from '$env/dynamic/public';
	const { PUBLIC_BACKEND_URL } = env;
	// State variables
	let showPrompt = $state(false);
	let permissionStatus = $state<NotificationPermission | null>(null);

	// Store to track if user has dismissed the prompt
	const NOTIFICATION_PROMPT_DISMISSED_KEY = 'openpleb-notification-prompt-dismissed';
	let promptDismissed = $state(false);

	// Function to check if browser supports notifications
	function browserSupportsNotifications(): boolean {
		return 'Notification' in window;
	}

	// Function to request notification permission
	async function requestNotificationPermission() {
		if (!browserSupportsNotifications()) {
			return;
		}

		try {
			const permission = await Notification.requestPermission();
			permissionStatus = permission;

			if (permission === 'granted') {
				// Permission granted, could show a test notification here
				const notification = new Notification('OpenPleb Notifications Enabled', {
					body: 'You will now receive updates about new offers.',
					icon: '/openpleb.svg'
				});
			}

			// Close the dialog
			showPrompt = false;
			await setupServiceWorkerEvents();
		} catch (error) {
			console.error('Error requesting notification permission:', error);
		}
	}

	// Function when user clicks "Later"
	function dismissPrompt() {
		showPrompt = false;
		// Don't save dismissed state to localStorage to allow showing again later
	}

	// Function when user clicks "Don't ask again"
	function neverShowAgain() {
		showPrompt = false;
		promptDismissed = true;
		localStorage.setItem(NOTIFICATION_PROMPT_DISMISSED_KEY, 'true');
	}

	onMount(() => {
		// Check if browser supports notifications
		if (!browserSupportsNotifications()) {
			return;
		}

		// Check current permission status
		permissionStatus = Notification.permission;

		// If already granted or denied, don't show prompt
		if (permissionStatus === 'granted' || permissionStatus === 'denied') {
			return;
		}

		// Check if user dismissed prompt previously
		const dismissed = localStorage.getItem(NOTIFICATION_PROMPT_DISMISSED_KEY);
		if (dismissed) {
			promptDismissed = true;
			return;
		}

		// Wait a bit before showing the notification prompt to avoid overwhelming the user
		// if they also see the install prompt
		setTimeout(() => {
			showPrompt = true;
		}, 0); // Show after 5 seconds
	});

	// Subscribe to service worker push events
	const setupServiceWorkerEvents = async () => {
		if (!('serviceWorker' in navigator)) {
			throw new Error('service worker not supported.');
		}

		// Register a service worker so we can receive push message event when
		// tab is closed.
		const register = await navigator.serviceWorker.ready;

        const res = await fetch(`${PUBLIC_BACKEND_URL}/vapid`)
        const {publicKey} = await res.json()
        console.log('subscribe with vapid key', publicKey);
        const vapidKeyUint8Array = base64ToUint8Array(publicKey)
        // Create a push subscription.
        const sub = await register.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: vapidKeyUint8Array
        });
        console.log(sub)
		if (sub == null) {
			console.error('no subscription');
			return;
		}
        console.log(sub)
		await fetch(`${PUBLIC_BACKEND_URL}/subscribe`, {
			method: 'POST',
            headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({subscription: sub})
		});
	};
</script>

{#if showPrompt && $appMode === 'earn'}
	<Dialog.Root bind:open={showPrompt}>
		<Dialog.Content class="sm:max-w-md">
			<Dialog.Header>
				<Dialog.Title class="flex items-center">
					<Bell class="mr-2 h-5 w-5" />
					Enable Notifications
				</Dialog.Title>
				<Dialog.Description>Stay updated on new offers!</Dialog.Description>
			</Dialog.Header>

			<div class="space-y-4 py-4">
				<div class="flex flex-col space-y-2">
					<div class="flex items-center rounded-md border p-3">
						<Bell class="text-primary mr-3 h-5 w-5" />
						<div>
							<p class="text-sm font-medium">Push notifications</p>
							<p class="text-muted-foreground text-xs">Get notified when app is closed</p>
						</div>
					</div>

					<div class="flex items-center rounded-md border p-3">
						<CheckCircle2 class="text-primary mr-3 h-5 w-5" />
						<div>
							<p class="text-sm font-medium">Offer Alerts</p>
							<p class="text-muted-foreground text-xs">Get alerts when new offers are listed</p>
						</div>
					</div>
				</div>

				<div class="flex flex-col justify-between space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
					<Button.Root variant="outline" class="flex-1" onclick={neverShowAgain}>
						<X class="mr-2 h-4 w-4" />
						Don't Ask Again
					</Button.Root>

					<Button.Root variant="outline" class="flex-1" onclick={dismissPrompt}>Later</Button.Root>

					<Button.Root class="flex-1" onclick={requestNotificationPermission}>
						<Bell class="mr-2 h-4 w-4" />
						Enable
					</Button.Root>
				</div>
			</div>
		</Dialog.Content>
	</Dialog.Root>
{/if}
