<script>
	import AppSidebar from "$lib/components/app-sidebar.svelte";
	import Separator from "$lib/components/ui/separator/separator.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar";
	import { initAuthed } from "$lib/init";
	import { onMount } from "svelte";
	const { children } = $props();
	let isInit = $state(false);

	onMount(async () => {
		await initAuthed();
		isInit = true
	});
</script>
<Sidebar.Provider>
    <AppSidebar />
    <Sidebar.Inset>
        <header class="flex h-16 shrink-0 items-center justify-start gap-2 border-b px-4">
            <Sidebar.Trigger class="-ml-1" />
            <Separator orientation="vertical" class="mr-2 h-4" />
        </header>
        <!-- <ParaglideJS {i18n}> -->
            <div class="flex h-full w-full flex-col items-center  justify-start gap-2 p-2">
            {#if isInit}
              
                {@render children()}
                {:else}
                    <div>Loading...</div>
                {/if}
            </div>
        <!-- </ParaglideJS> -->
    </Sidebar.Inset>
</Sidebar.Provider>