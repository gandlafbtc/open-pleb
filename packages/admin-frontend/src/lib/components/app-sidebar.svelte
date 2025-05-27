
<script lang="ts">
	import VersionSwitcher from '$lib/components/version-switcher.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index';
	import { onMount, type ComponentProps } from 'svelte';
	import { page } from '$app/state';
	import { priceStore } from '$lib/stores/price';
	import { formatCurrency } from '$lib/helper';
	import {
	env } from '$env/dynamic/public';
	import ToggleDarkMode from '$lib/elements/ToggleDarkMode.svelte';
	import NavUser from './nav-user.svelte';

	let sidebar = $state();
	onMount(() => {
		sidebar = Sidebar.useSidebar();
	});

	const {PUBLIC_BOND_FLAT_RATE,
	PUBLIC_BOND_PERCENTAGE,
		PUBLIC_CURRENCY,
		PUBLIC_PLATFORM_FEE_FLAT_RATE,
		PUBLIC_PLATFORM_FEE_PERCENTAGE,
		PUBLIC_TAKER_FEE_FLAT_RATE,
		PUBLIC_TAKER_FEE_PERCENTAGE
	}	= env;

	const data = $derived({
		navMain: [

			{
				title: '',
				url: '/',
				items: [
					{
						title: 'Home',
						url: '/'
					}
				]
				
			}
		],
	})

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root {...restProps} bind:ref>
	<Sidebar.Header>
		<VersionSwitcher />
	</Sidebar.Header>
	<Sidebar.Content>
		<!-- We create a Sidebar.Group for each parent. -->
		{#each data.navMain as group (group.title)}
			<Sidebar.Group>
				<Sidebar.GroupLabel>{group.title}</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each group.items as item (item.title)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton isActive={page.url.pathname === item.url} onclick={() => (sidebar.isMobile ? sidebar.toggle() : '')}>
									{#snippet child({ props })}
										<a href={item.url} {...props}>{item.title}</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{/each}

	</Sidebar.Content>
	<Sidebar.Footer>
		<ToggleDarkMode></ToggleDarkMode>
		<NavUser />
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
