<script lang="ts">
    import type { Snippet } from 'svelte';
    import "./layout.css";
    import type { LayoutData } from './$types';
    import { ModeWatcher } from "mode-watcher";
    import SplashScreen from '$lib/components/SplashScreen.svelte';
    
    let { data, children }: { data: LayoutData, children: Snippet } = $props();
    
    let showContent = $state(false);
    
    function handleSplashComplete() {
        showContent = true;
    }
</script>

<ModeWatcher />

<SplashScreen onComplete={handleSplashComplete} />

{#if showContent}
    {@render children()}
{/if}
