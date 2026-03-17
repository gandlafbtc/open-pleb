<script>
	import DarkmodeToggle from "$lib/components/ui/custom/DarkmodeToggle.svelte";
	import LanguageSelector from "$lib/components/ui/custom/LanguageSelector.svelte";
	import RefreshBackend from "$lib/components/ui/custom/RefreshBackend.svelte";
	import DeleteButton from "$lib/elements/settings/DeleteButton.svelte";
    import LnurlSettings from "$lib/elements/settings/LnurlSettings.svelte";
	import SeedSettings from "$lib/elements/settings/SeedSettings.svelte";
	import EnvSettings from "$lib/elements/settings/EnvSettings.svelte";
	import BackendSettings from "$lib/elements/settings/BackendSettings.svelte";
	import { getAppApiBaseUrl } from "$lib/interface/rest/const";
</script>

<div class="container mx-auto space-y-4">
    <header class="space-y-2">
        <p class="text-center text-sm uppercase tracking-[0.3em] text-muted-foreground">Settings</p>

    </header>

    <section class="space-y-4 border border-border rounded-2xl p-3 shadow-sm shadow-black/5">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm uppercase tracking-[0.3em] text-muted-foreground">General</p>
            </div>
        </div>
        <div class="text-sm text-muted-foreground">
            <div class="grid gap-2 md:grid-cols-3">
                <!-- Placeholder controls -->
                <div class="rounded-xl border border-border p-3 flex justify-between items-center">
                    <p class="font-medium">Theme</p>
					<DarkmodeToggle></DarkmodeToggle>
				</div>
                <div class="rounded-xl border border-border p-3 flex justify-between items-center">
                    <p class="font-medium">Language</p>
				<LanguageSelector></LanguageSelector>
				</div>
            </div>
        </div>
    </section>

        <section class="space-y-4 border border-border rounded-2xl p-3 shadow-sm shadow-black/5">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm uppercase tracking-[0.3em] text-muted-foreground">Backend</p>
            </div>
        </div>
        <div class="text-sm text-muted-foreground">
            <div class="space-y-3">
                <div class="rounded-xl border border-border p-3 flex justify-between items-center">
                    <div>

                        <p class="font-medium">Connected Backend</p>
                        <p class="text-xs">

                            {getAppApiBaseUrl()}
                        </p>
                    </div>
					<RefreshBackend/>
				</div>
            </div>
        </div>
        <EnvSettings />
        <BackendSettings />
    </section>


    <section class="space-y-4 border border-border rounded-2xl p-3 shadow-sm shadow-black/5">
            <div>
                <p class="text-sm uppercase tracking-[0.3em] text-muted-foreground">Payments</p>
        </div>
        <LnurlSettings />
    </section>

    <section class="space-y-4 border border-border rounded-2xl p-3 shadow-sm shadow-black/5">
            <div>
                <p class="text-sm uppercase tracking-[0.3em] text-muted-foreground">ID</p>
        </div>
        <SeedSettings />
    </section>

    <section class="space-y-4 border border-secondary rounded-2xl p-6 bg-secondary/5">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm uppercase tracking-[0.3em] text-[rgb(226,200,0)]">Reset</p>
            </div>
        </div>
        <div class="text-sm text-warning">
            <div class="mt-4 flex flex-wrap gap-3">
                <button class="rounded-full border border-secondary px-4 py-2 font-semibold text-warning transition hover:bg-secondary/10 text-[rgb(226,200,0)]">
                    Reset settings
                </button>
            </div>
        </div>
    </section>
    <section class="space-y-4 border border-destructive rounded-2xl p-6 bg-destructive/5">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm uppercase tracking-[0.3em] text-destructive font-bold">Danger zone</p>
            </div>
        </div>
        <div class="text-sm text-destructive">
            <p>These actions cannot be undone. Proceed only if you fully understand the consequences.</p>
        </div>
        <DeleteButton></DeleteButton>
    </section>

</div>