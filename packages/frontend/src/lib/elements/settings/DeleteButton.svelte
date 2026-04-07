<script lang="ts">
	import { DB } from "$lib/state/persistent/db/db";
    import { delay } from "common/util";
	import { toast } from "svelte-sonner";

    const confirm = async () => {
        await DB.deleteDatabase();
		toast.promise(delay(1000), {
				loading: "Deleting...",
				success: "Restarting..."
			});
			await delay(1000);
			localStorage.clear()
			window.location.reload();
			await delay(2000);
    }
</script>

	<button onclick={confirm} class="rounded-full border border-destructive px-4 py-2 font-semibold text-destructive transition hover:bg-destructive/10">
			Delete everything
    </button>