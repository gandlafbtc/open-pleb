<script>
	import { page } from "$app/state";

	import SettingsButton from "../settings/SettingsButton.svelte";
	import BackButton from "./BackButton.svelte";
	import BackOrLogo from "./BackOrLogo.svelte";
	import SessionManager from "../session/SessionManager.svelte";

</script>

    <div class="w-full flex items-center justify-between h-16 p-1">
        <BackOrLogo></BackOrLogo>
        <SessionManager></SessionManager>
        <div>
            {#if !page.url.pathname.startsWith("/settings")}
		    <SettingsButton></SettingsButton>
                {:else}
                <BackButton isX></BackButton>
            {/if}
        </div>
    </div>
