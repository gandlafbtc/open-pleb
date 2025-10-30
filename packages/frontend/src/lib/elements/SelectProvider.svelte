	
<script lang="ts">
    import * as Select from "$lib/components/ui/select/index.js";
	import { dataStore } from "$lib/stores/session/data.svelte";
	import type { FiatProvider } from "@openPleb/common/db/schema";
	import { onMount } from "svelte";
    
    interface Props {provider: FiatProvider | undefined, matchAddress?: string}
    
    let {provider = $bindable(), matchAddress }: Props = $props();

    onMount(() => {
        if (matchAddress) {
            const match = dataStore.providers.find(p => {
                if (!p.matchTemplate) {
                    return false
                }
                return matchAddress.includes(p.matchTemplate)
            })
            if (match) {
                provider = match
            }
        }
    });

  </script>
   
   
   <Select.Root
	type="single"
	onValueChange={(value) => {
		const id = Number(value);
		provider = Number.isNaN(id)
			? undefined
			: dataStore.providers.find((p) => p.id === id);
	}}
>
       <Select.Trigger class="w-[180px]"> 
        {#if provider}
        <img src="{provider.icon}" alt="" class="w-4 h-4 "/>{provider.label}
          
        {:else}
        Unknown provider
        {/if}
    </Select.Trigger>
       <Select.Content>
           {#each dataStore.providers as p}
           <Select.Item value={String(p.id)} class="flex items-center gap-2">
               <img src="{p.icon}" alt="" class="w-4 h-4 ">
               {p.label}
            </Select.Item>
            {/each}
        </Select.Content>
    </Select.Root>
    
  
