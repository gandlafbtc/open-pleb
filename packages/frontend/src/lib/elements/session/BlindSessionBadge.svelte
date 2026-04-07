<script lang="ts">
	import { blindSessionState } from '$lib/state/dynamic/blindSession.svelte';
	import { blindSessionService } from '$lib/interface/rest/blindSession.service';
	import { Clock, UserCheck, UserPlus, ChevronDown, X } from '@lucide/svelte';
	import { onMount, onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';

	let timeRemaining = $state('');
	let intervalId: number | undefined;
	let showRoleSelector = $state(false);
	let isLoading = $state(false);
	let showCloseDialog = $state(false);

	const { isActive, role } = $derived({
		isActive: blindSessionState.isActive,
		role: blindSessionState.role
	});

	function updateTimer() {
		timeRemaining = blindSessionService.formatTimeRemaining();
		blindSessionService.checkSessionValidity();
	}

	onMount(() => {
		updateTimer();
		intervalId = window.setInterval(updateTimer, 1000);
	});

	onDestroy(() => {
		if (intervalId) {
			clearInterval(intervalId);
		}
	});

	const roleIcon = $derived(role === 'maker' ? UserPlus : UserCheck);
	const roleLabel = $derived(role === 'maker' ? 'Maker' : 'Taker');

	function toggleRoleSelector() {
		if (!isActive) {
			showRoleSelector = !showRoleSelector;
		}
	}

	function closeRoleSelector() {
		showRoleSelector = false;
	}

	async function selectRole(selectedRole: 'maker' | 'taker') {
		isLoading = true;
		closeRoleSelector();
		try {
			await blindSessionService.openSession(selectedRole);
			toast.success(`Blind session opened as ${selectedRole}`);
		} catch (error) {
			toast.error('Failed to open blind session');
			console.error(error);
		} finally {
			isLoading = false;
		}
	}

	async function handleCloseSession() {
		isLoading = true;
		showCloseDialog = false;
		try {
			await blindSessionService.closeSession();
		} catch (error) {
			console.error('Failed to close session:', error);
		} finally {
			isLoading = false;
		}
	}
</script>

{#if isActive}
	<div class="h-8 flex items-center gap-2 px-2 py-1 bg-secondary/10 rounded-md text-xs">
		<div class="flex items-center gap-1">
			<svelte:component this={roleIcon} class="w-3 h-3 text-secondary" />
			<span class="font-medium">{roleLabel}</span>
		</div>
		<div class="flex items-center gap-1 text-muted-foreground">
			<Clock class="w-3 h-3" />
			<span class="font-mono">{timeRemaining}</span>
		</div>
		<button
			onclick={() => (showCloseDialog = true)}
			disabled={isLoading}
			class="ml-1 p-0.5 hover:bg-destructive/20 rounded transition-colors disabled:opacity-50"
			aria-label="Close session"
		>
			<X class="w-3 h-3 text-yellow-500" />
		</button>
	</div>

	<Dialog.Root bind:open={showCloseDialog}>
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>Close Session</Dialog.Title>
				<Dialog.Description>
					Are you sure you want to close this session? 
				</Dialog.Description>
			</Dialog.Header>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => (showCloseDialog = false)}>Cancel</Button>
				<Button variant="destructive" onclick={handleCloseSession} disabled={isLoading}>
					Close Session
				</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<div class="relative">
		<button
			onclick={toggleRoleSelector}
			disabled={isLoading}
			class=" h-8 flex items-center gap-1 px-2 py-1 bg-secondary/10 rounded-md text-xs hover:bg-secondary/20 transition-colors disabled:opacity-50"
		>
			<UserCheck class="w-3 h-3 text-secondary" />
			<span class="font-medium">Select Role</span>
			<ChevronDown class="w-3 h-3 text-secondary" />
		</button>

		{#if showRoleSelector}
			<button
				class="fixed inset-0 z-40"
				onclick={closeRoleSelector}
				tabindex="-1"
				aria-hidden="true"
			></button>
			<div
				class="absolute right-0 mt-1 w-40 bg-background border border-border rounded-md shadow-lg z-50"
			>
				<div class="py-1">
					<button
						onclick={() => selectRole('maker')}
						class="cursor-pointer rounded-md hover:bg-foreground/10 w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2"
					>
						<UserPlus class="w-4 h-4" />
						Maker
					</button>
					<button
						onclick={() => selectRole('taker')}
						class="cursor-pointer rounded-md hover:bg-foreground/10 w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2"
					>
						<UserCheck class="w-4 h-4" />
						Taker
					</button>
				</div>
			</div>
		{/if}
	</div>
{/if}
