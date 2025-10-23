<script lang="ts">
  import { onMount } from 'svelte';
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Button from "$lib/components/ui/button";
  import { Download, X, ArrowRight, Phone, Bell, Home, Smartphone } from 'lucide-svelte';
	import { browser } from '$app/environment';
  
  // Type for BeforeInstallPromptEvent (not included in standard DOM types)
  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    prompt(): Promise<{
      outcome: 'accepted' | 'dismissed';
    }>;
    userChoice: Promise<{
      outcome: 'accepted' | 'dismissed';
      platform: string;
    }>;
  }

  const getDeferredPrompt = () => {
    if (!browser) {
      return null;
    }
    const typedWindow = window as typeof window & {
      deferredOnInstallPrompt?: BeforeInstallPromptEvent | null;
    };
    return typedWindow.deferredOnInstallPrompt ?? null;
  };

  let deferredPrompt: BeforeInstallPromptEvent | null = getDeferredPrompt();
  let showPrompt = $state(false);
  let isPWAInstalled = $state(false);


  // Store to track if user has dismissed the prompt
  const INSTALL_PROMPT_DISMISSED_KEY = 'openpleb-install-prompt-dismissed';
  let promptDismissed = $state(false);

  onMount(() => {
    // Check if already installed as PWA
    console.log('deferredPrompt:', deferredPrompt);
    if (!browser) {
      return
    }
    if (window.matchMedia('(display-mode: standalone)').matches) {
      isPWAInstalled = true;
      return;
    }


    // Check if user dismissed prompt previously
    const dismissed = localStorage.getItem(INSTALL_PROMPT_DISMISSED_KEY);
    if (dismissed) {
      promptDismissed = true;
      return
    }
    
    if (deferredPrompt) {
      showPrompt = true;
      
    }
    // Listen for beforeinstallprompt event to capture install prompt


    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      // App was installed successfully
      isPWAInstalled = true;
      showPrompt = false;
      deferredPrompt = null;
      
      // Can log analytics event here if needed
      console.log('PWA was installed');
    });
  });

  // Triggered when user clicks "Install" button
  async function installApp() {
    if (!deferredPrompt) {
      return;
    }

    // Show the browser's install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // Log outcome for analytics
    console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} the install prompt`);
    
    // Clear the saved prompt since it can't be used twice
    deferredPrompt = null;
    
    // Close our custom dialog
    showPrompt = false;
  }

  // Triggered when user clicks "Later" button
  function dismissPrompt() {
    showPrompt = false;
    
    // Don't save dismissed state to localStorage to allow showing it again
  }

  // Triggered when user clicks "Don't show again" button
  function neverShowAgain() {
    showPrompt = false;
    promptDismissed = true;
    localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY, 'true');
  }
</script>

{#if showPrompt}
  <Dialog.Root bind:open={showPrompt}>
    <Dialog.Content class="sm:max-w-md">
      <Dialog.Header>
        <Dialog.Title class="flex items-center">
          <Download class="mr-2 h-5 w-5" />
          Install OpenPleb App
        </Dialog.Title>
        <Dialog.Description>
          Get the best experience by installing OpenPleb on your device
        </Dialog.Description>
      </Dialog.Header>
      
      <div class="space-y-4 py-4">
        <div class="flex flex-col space-y-2">
          <div class="flex items-center rounded-md border p-3">
            <Smartphone class="mr-3 h-5 w-5 text-primary" />
            <div>
              <p class="text-sm font-medium">App experience</p>
              <p class="text-xs text-muted-foreground">No browser address bar, more screen space</p>
            </div>
          </div>
          
          <div class="flex items-center rounded-md border p-3">
            <Bell class="mr-3 h-5 w-5 text-primary" />
            <div>
              <p class="text-sm font-medium">Notifications</p>
              <p class="text-xs text-muted-foreground">Get notified when new offers are listed</p>
            </div>
          </div>
          
          <div class="flex items-center rounded-md border p-3">
            <Home class="mr-3 h-5 w-5 text-primary" />
            <div>
              <p class="text-sm font-medium">Home Screen</p>
              <p class="text-xs text-muted-foreground">Launch directly from your home screen</p>
            </div>
          </div>
        </div>

        <div class="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0 justify-between">
          <Button.Root variant="outline" class="flex-1" onclick={neverShowAgain}>
            <X class="mr-2 h-4 w-4" />
            Don't Show Again
          </Button.Root>
          
          <Button.Root variant="outline" class="flex-1" onclick={dismissPrompt}>
            Later
          </Button.Root>
          
          <Button.Root class="flex-1" onclick={installApp}>
            <Download class="mr-2 h-4 w-4" />
            Install Now
          </Button.Root>
        </div>
      </div>
    </Dialog.Content>
  </Dialog.Root>
{/if}
