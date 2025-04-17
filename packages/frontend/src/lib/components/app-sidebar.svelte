<script lang="ts" module>
	const data = {
		versions: ['1.0.0'],
		navMain: [
			{
				title: 'Apps',
				url: '/',
				items: [
					{
						title: 'Pay',
						url: '/pay'
					},
					{
						title: 'Earn',
						url: '/earn'
					}
				]
			},
			{
				title: 'Home',
				url: '/home',
				items: [
					{
						title: 'My Offers',
						url: '/home/my-offers'
					},
					{
						title: 'My Claims',
						url: '/home/my-claims'
					}
				]
			}
		],
	};
</script>

<script lang="ts">
	import VersionSwitcher from '$lib/components/version-switcher.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import { page } from '$app/state';
	import { Group } from 'lucide-svelte';
	import { priceStore } from '$lib/stores/price';
	import { formatCurrency } from '$lib/helper';
	import {
	PUBLIC_BOND_PERCENTAGE,
		PUBLIC_PLATFORM_FEE_FLAT_RATE,
		PUBLIC_PLATFORM_FEE_PERCENTAGE,
		PUBLIC_TAKER_FEE_FLAT_RATE,
		PUBLIC_TAKER_FEE_PERCENTAGE
	} from '$env/static/public';

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root {...restProps} bind:ref>
	<Sidebar.Header>
		<VersionSwitcher versions={data.versions} defaultVersion={data.versions[0]} />
	</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel
				>Conversion

				<Sidebar.MenuBadge>
					1 BTC =
					{formatCurrency($priceStore, 'KRW')}
				</Sidebar.MenuBadge>
			</Sidebar.GroupLabel>
			<Sidebar.GroupLabel
				>Platform fee percentage

				<Sidebar.MenuBadge>
					{PUBLIC_PLATFORM_FEE_PERCENTAGE}%
				</Sidebar.MenuBadge>
			</Sidebar.GroupLabel>
			<Sidebar.GroupLabel
				>Platform fee flat

				<Sidebar.MenuBadge>
					{formatCurrency(Number.parseInt(PUBLIC_PLATFORM_FEE_FLAT_RATE), 'SAT')}
				</Sidebar.MenuBadge>
			</Sidebar.GroupLabel>
			<Sidebar.GroupLabel
				>Taker fee percentage

				<Sidebar.MenuBadge>
					{PUBLIC_TAKER_FEE_PERCENTAGE}%
				</Sidebar.MenuBadge>
			</Sidebar.GroupLabel>
			<Sidebar.GroupLabel
				>Taker fee flat

				<Sidebar.MenuBadge>
					{formatCurrency(Number.parseInt(PUBLIC_TAKER_FEE_FLAT_RATE), 'SAT')}
				</Sidebar.MenuBadge>
			</Sidebar.GroupLabel>
			<Sidebar.GroupLabel
			>Taker/Maker bond

			<Sidebar.MenuBadge>
				{PUBLIC_BOND_PERCENTAGE}%
			</Sidebar.MenuBadge>
		</Sidebar.GroupLabel>
		</Sidebar.Group>
		<!-- We create a Sidebar.Group for each parent. -->
		{#each data.navMain as group (group.title)}
			<Sidebar.Group>
				<Sidebar.GroupLabel>{group.title}</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each group.items as item (item.title)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton isActive={page.url.pathname === item.url}>
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
	<Sidebar.Rail />
</Sidebar.Root>
