<script>
	import { page } from "$app/state";

	import SettingsButton from "../settings/SettingsButton.svelte";
	import BackButton from "./BackButton.svelte";
	import BackOrLogo from "./BackOrLogo.svelte";
	import BlindSessionStatus from "./BlindSessionStatus.svelte";

</script>

    <div class="w-full flex justify-between h-16 p-2">
        <BackOrLogo></BackOrLogo>
        <BlindSessionStatus></BlindSessionStatus>
        <div>
            {#if !page.url.pathname.startsWith("/settings")}
			    <SettingsButton></SettingsButton>
                {:else}
                <BackButton isX></BackButton>
            {/if}
        </div>
    </div>
