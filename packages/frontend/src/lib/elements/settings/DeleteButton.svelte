<script lang="ts">
	import { DB } from "$lib/state/persistent/db/db";
	import { ensureError } from "common/errors";
    import { delay } from "common/util";
	import { toast } from "svelte-sonner";

    const confirm = async () => {
		try {
			
			toast.promise(delay(1000), {
				loading: "Deleting...",
				success: "Restarting..."
			});
			await DB.deleteDatabase();
			await delay(1000);
			localStorage.clear()
			window.location.reload();
			await delay(2000);
		} catch (error) {
			const err = ensureError(error)
			console.error(err)
			toast.error(err.message)
		}
    }
</script>

	<button onclick={confirm} class="rounded-full border border-destructive px-4 py-2 font-semibold text-destructive transition hover:bg-destructive/10">
			Delete everything
    </button>