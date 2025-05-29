
<script lang="ts">
	import VersionSwitcher from '$lib/components/version-switcher.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index';
	import { onMount, type ComponentProps } from 'svelte';
	import { page } from '$app/state';
	import { priceStore } from '$lib/stores/price';
	import { formatCurrency } from '$lib/helper';

	import { dataStore } from '$lib/stores/session/data.svelte';
	import { appMode } from '$lib/stores/local/mode';
	import { OFFER_STATE } from '@openPleb/common/types';
	import ToggleDarkMode from '$lib/elements/settings/ToggleDarkMode.svelte';

	let sidebar = $state();
	onMount(() => {
		sidebar = Sidebar.useSidebar();
	});

	const {OPENPLEB_BOND_FLAT_RATE,
		OPENPLEB_BOND_PERCENTAGE,
		OPENPLEB_CURRENCY,
		OPENPLEB_PLATFORM_FEE_FLAT_RATE,
		OPENPLEB_PLATFORM_FEE_PERCENTAGE,
		OPENPLEB_TAKER_FEE_FLAT_RATE,
		OPENPLEB_TAKER_FEE_PERCENTAGE
	}	= dataStore.env;

	const data = $derived({
		navMain: [

			{
				title: '',
				url: '/',
				items: [
					{
						title: $appMode==="pay" ? 'Pay' : 'Offers',
						url: '/'
					},
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
	})

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root {...restProps} bind:ref>
	<Sidebar.Header>
		<VersionSwitcher />
	</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel
				>Takers
				<Sidebar.MenuBadge>
					<div class='flex gap-2 items-center'>
	
						<div class="rounded-full {dataStore.takers?"bg-green-500":"bg-red-500"} w-1 h-1">
							
						</div>
						<p>
	
							{dataStore.takers}
						</p>
					</div>
				</Sidebar.MenuBadge>
			</Sidebar.GroupLabel>
			<Sidebar.GroupLabel
			>Makers

			<Sidebar.MenuBadge>
				<div class='flex gap-2 items-center'>

					<div class="rounded-full {dataStore.makers?"bg-green-500":"bg-red-500"} w-1 h-1">
						
					</div>
					<p>

						{dataStore.makers}
					</p>
				</div>
			</Sidebar.MenuBadge>
		</Sidebar.GroupLabel>
		<Sidebar.GroupLabel
		>Conversion

		<Sidebar.MenuBadge>
			1 BTC =
			{formatCurrency($priceStore, OPENPLEB_CURRENCY)}
		</Sidebar.MenuBadge>
	</Sidebar.GroupLabel>
			<Sidebar.GroupLabel
				>Platform fee percentage

				<Sidebar.MenuBadge>
					{OPENPLEB_PLATFORM_FEE_PERCENTAGE}%
				</Sidebar.MenuBadge>
			</Sidebar.GroupLabel>
			<Sidebar.GroupLabel
				>Platform fee flat

				<Sidebar.MenuBadge>
					{formatCurrency(Number.parseInt(OPENPLEB_PLATFORM_FEE_FLAT_RATE), 'SAT')}
				</Sidebar.MenuBadge>
			</Sidebar.GroupLabel>
			<Sidebar.GroupLabel
				>Taker fee percentage

				<Sidebar.MenuBadge>
					{OPENPLEB_TAKER_FEE_PERCENTAGE}%
				</Sidebar.MenuBadge>
			</Sidebar.GroupLabel>
			<Sidebar.GroupLabel
				>Taker fee flat

				<Sidebar.MenuBadge>
					{formatCurrency(Number.parseInt(OPENPLEB_TAKER_FEE_FLAT_RATE), 'SAT')}
				</Sidebar.MenuBadge>
			</Sidebar.GroupLabel>
			<Sidebar.GroupLabel
			>Taker/Maker bond percentage

			<Sidebar.MenuBadge>
				{OPENPLEB_BOND_PERCENTAGE}%
			</Sidebar.MenuBadge>
		</Sidebar.GroupLabel>
		<Sidebar.GroupLabel
		>Taker/Maker bond flat
		<Sidebar.MenuBadge>
			{formatCurrency(Number.parseInt(OPENPLEB_BOND_FLAT_RATE), 'SAT')}
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
								<Sidebar.MenuButton isActive={page.url.pathname === item.url} onclick={() => (sidebar.isMobile ? sidebar.toggle() : '')}>
									{#snippet child({ props })}
										<a href={item.url} {...props}>{item.title}</a>
									{/snippet}
								</Sidebar.MenuButton>
								{#if item.title==="Offers"}
									<Sidebar.MenuBadge>
										{dataStore.offers.filter((offer) => offer.status === OFFER_STATE.INVOICE_PAID).length}
									</Sidebar.MenuBadge>
								{/if}
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{/each}
	<Sidebar.Footer>
		<ToggleDarkMode></ToggleDarkMode>
	</Sidebar.Footer>
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
