
<script lang="ts">
 
 import { Button } from "$lib/components/ui/button/index.js";
	import { getEnvSettings } from "$lib/interface/rest/env.service";
	import { RefreshCw } from "@lucide/svelte";
	import { ensureError } from "common/errors";
	import { toast } from "svelte-sonner";

    let isLoading = $state(false)
    const refreshEnv = async () => {
        try {
            isLoading = true
            await getEnvSettings()
            toast.success("Refreshed backend")
        } catch (error) {
            const err = ensureError(error)
            console.error(err)
            toast.error(err.message)
        }
        finally {
            isLoading = false
        }
    }
</script>
 
<Button onclick={refreshEnv} variant="outline" size="icon">
 <RefreshCw class='{isLoading?"animate-spin":""}' disabled={isLoading}
 />
</Button>