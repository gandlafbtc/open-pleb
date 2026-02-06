<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Popover from '$lib/components/ui/popover';
	import { Globe, Check } from '@lucide/svelte';
	import { getLocale, setLocale, locales, type Locale } from '$lib/paraglide/runtime';

	const languageNames: Record<Locale, string> = {
		en: 'English',
		kr: '한국어'
	};

	let open = $state(false);
	const currentLocale = $derived(getLocale());

	function handleLocaleChange(locale: Locale) {
		setLocale(locale);
		open = false;
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger>
		<Button variant="ghost" class="gap-2 rounded-full">
			{currentLocale.toUpperCase()}
			<Globe class="h-6 w-6" />
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-48 p-2">
		<div class="flex flex-col gap-1">
			{#each locales as locale}
				<Button
					variant={currentLocale === locale ? 'default' : 'ghost'}
					class="w-full justify-between"
					onclick={() => handleLocaleChange(locale)}
				>
					<span>{languageNames[locale]}</span>
					{#if currentLocale === locale}
						<Check class="h-4 w-4" />
					{/if}
				</Button>
			{/each}
		</div>
	</Popover.Content>
</Popover.Root>
