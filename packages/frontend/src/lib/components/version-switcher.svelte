<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import Check from '@lucide/svelte/icons/check';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import GalleryVerticalEnd from '@lucide/svelte/icons/gallery-vertical-end';

	let { defaultVersion }: { versions: string[]; defaultVersion: string } = $props();

	let selectedVersion = $state(defaultVersion);
</script>

<a href="/" class="flex gap-2">
	<div
		class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
	>
		<GalleryVerticalEnd class="size-4" />
	</div>
	<div class="flex flex-col gap-0.5 leading-none">
		<span class="font-semibold">OpenPleb</span>
		<span class="">v{selectedVersion}</span>
	</div>
</a>
