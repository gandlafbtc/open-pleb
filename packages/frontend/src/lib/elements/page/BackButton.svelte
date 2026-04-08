<script lang="ts">
    import { goto} from '$app/navigation';
    import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Button from '$lib/components/ui/button/button.svelte';
	import { ChevronLeft, X } from '@lucide/svelte';

  interface Props {isX?: boolean}
  
  let {isX = false}: Props = $props();

  const goBack = () => {
    const route = page.url.pathname.split("/")
    route.pop()
    const path = "/"+route.join("/")
    goto(resolve(path))
  }
</script>
<Button variant='ghost' onclick={goBack}>
    {#if isX}
      <X></X>
    {:else}
    <ChevronLeft></ChevronLeft>
    {/if}
</Button>