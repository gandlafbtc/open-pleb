<script>
	import DarkmodeToggle from '$lib/components/ui/custom/DarkmodeToggle.svelte';
	import LanguageSelector from '$lib/components/ui/custom/LanguageSelector.svelte';
	import RefreshBackend from '$lib/components/ui/custom/RefreshBackend.svelte';
	import DeleteButton from '$lib/elements/settings/DeleteButton.svelte';
	import LnurlSettings from '$lib/elements/settings/LnurlSettings.svelte';
	import SeedSettings from '$lib/elements/settings/SeedSettings.svelte';
	import EnvSettings from '$lib/elements/settings/EnvSettings.svelte';
	import BackendSettings from '$lib/elements/settings/BackendSettings.svelte';
	import { getAppApiBaseUrl } from '$lib/interface/rest/const';
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';
	import IDSettings from '$lib/elements/settings/IDSettings.svelte';
</script>

<div class="container mx-auto space-y-4">
	<header class="space-y-2">
		<p class="text-center text-sm tracking-[0.3em] text-muted-foreground uppercase">Settings</p>
	</header>

	<Tabs value="general" class="w-full">
		<TabsList class="w-full grid grid-cols-4">
			<TabsTrigger value="general">General</TabsTrigger>
			<TabsTrigger value="account">Account</TabsTrigger>
			<TabsTrigger value="backend">Backend</TabsTrigger>
			<TabsTrigger value="danger">Danger Zone</TabsTrigger>
		</TabsList>

		<!-- General Tab -->
		<TabsContent value="general" class="space-y-4">
			<section class="space-y-4 rounded-2xl border border-border p-3 shadow-sm shadow-black/5">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm tracking-[0.3em] text-muted-foreground uppercase">General</p>
					</div>
				</div>
				<div class="text-sm text-muted-foreground">
					<div class="grid gap-2 md:grid-cols-3">
						<div class="flex items-center justify-between rounded-xl border border-border p-3">
							<p class="font-medium">Theme</p>
							<DarkmodeToggle></DarkmodeToggle>
						</div>
						<div class="flex items-center justify-between rounded-xl border border-border p-3">
							<p class="font-medium">Language</p>
							<LanguageSelector></LanguageSelector>
						</div>
					</div>
				</div>
			</section>
		</TabsContent>

		<!-- Account Tab -->
		<TabsContent value="account" class="space-y-4">
			<section class="space-y-4 rounded-2xl border border-border p-3 shadow-sm shadow-black/5">
				<div>
					<p class="text-sm tracking-[0.3em] text-muted-foreground uppercase">ID</p>
				</div>
				<IDSettings />
			</section>
						<section class="space-y-4 rounded-2xl border border-border p-3 shadow-sm shadow-black/5">
				<div>
					<p class="text-sm tracking-[0.3em] text-muted-foreground uppercase">Payments</p>
				</div>
				<LnurlSettings />
			</section>
			<section class="space-y-4 rounded-2xl border border-border p-3 shadow-sm shadow-black/5">
				<div>
					<p class="text-sm tracking-[0.3em] text-muted-foreground uppercase">Backup</p>
				</div>
				<SeedSettings />
			</section>

		</TabsContent>

		<!-- Backend Tab -->
		<TabsContent value="backend" class="space-y-4">
			<section class="space-y-4 rounded-2xl border border-border p-3 shadow-sm shadow-black/5">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm tracking-[0.3em] text-muted-foreground uppercase">Backend</p>
					</div>
				</div>
				<div class="text-sm text-muted-foreground">
					<div class="space-y-3">
						<div class="flex items-center justify-between rounded-xl border border-border p-3">
							<div>
								<p class="font-medium">Connected Backend</p>
								<p class="text-xs">
									{getAppApiBaseUrl()}
								</p>
							</div>
							<RefreshBackend />
						</div>
					</div>
				</div>
				<EnvSettings />
				<BackendSettings />
			</section>
		</TabsContent>

		<!-- Danger Zone Tab -->
		<TabsContent value="danger" class="space-y-4">
			<section class="space-y-4 rounded-2xl border border-secondary bg-secondary/5 p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm tracking-[0.3em] text-[rgb(226,200,0)] uppercase">Reset</p>
					</div>
				</div>
				<div class="text-warning text-sm">
					<div class="mt-4 flex flex-wrap gap-3">
						<button
							class="text-warning rounded-full border border-secondary px-4 py-2 font-semibold text-[rgb(226,200,0)] transition hover:bg-secondary/10"
						>
							Reset settings
						</button>
					</div>
				</div>
			</section>

			<section class="space-y-4 rounded-2xl border border-destructive bg-destructive/5 p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-bold tracking-[0.3em] text-destructive uppercase">Danger zone</p>
					</div>
				</div>
				<div class="text-sm text-destructive">
					<p>These actions cannot be undone. Proceed only if you fully understand the consequences.</p>
				</div>
				<DeleteButton></DeleteButton>
			</section>
		</TabsContent>
	</Tabs>
</div>
