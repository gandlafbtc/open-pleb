<script lang="ts">
	import Config from "$lib/Config.svelte";
	import type { PageData } from "../$types";

	interface Props {data: PageData}
	
	let {data}: Props = $props();
</script>
<Config {data}></Config>