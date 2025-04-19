<script>

	import * as Tabs from "$lib/components/ui/tabs";
	import { appMode } from "$lib/stores/local/mode";
	import { settingsStore } from "cashu-wallet-engine";
	import { Check, EyeClosed } from "lucide-svelte";

    let value = $derived($appMode);

    $effect(() => {
        if (value !== $appMode) {
            appMode.set(value)}
    });

</script>
<Tabs.Root bind:value>
    <Tabs.List>
    <Tabs.Trigger value="pay">
        {#if value === "pay"}
        <Check class='h-5 w-5'></Check>
        {:else}
        <EyeClosed class='h-5 w-5'></EyeClosed>          
        {/if}
        Pay
    </Tabs.Trigger>
      <Tabs.Trigger value="earn">
        {#if value === "earn"}
        <Check class='h-5 w-5'></Check>
        {:else}
        <EyeClosed class='h-5 w-5'></EyeClosed>          
        {/if}Earn</Tabs.Trigger>
    </Tabs.List>
  </Tabs.Root>