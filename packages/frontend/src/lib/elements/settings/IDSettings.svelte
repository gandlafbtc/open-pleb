<script lang="ts">
	import { idKeys } from '$lib/state/dynamic/id.svelte';
	import { copyTextToClipboard } from '$lib/utils';
	import encodeQR from 'qr';
	import { Copy } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	function handleCopy() {
		copyTextToClipboard(idKeys.getNpub());
		toast.success('Npub copied to clipboard');
	}
</script>
{#if idKeys.pubkey}

<div class="flex flex-col gap-4">
	<div class="flex flex-col gap-2 items-center">
		<div class=" max-w-40 flex flex-col gap-2">
			<div class="bg-white rounded-md">
				
				{@html encodeQR(idKeys.getNpub(),"svg")}
			</div>
			<div class="flex items-center gap-2">
				
				<p class="wrap-anywhere text-xs flex-1">
					
					{idKeys.getNpub()}
				</p>
			</div>
		</div>
	</div>
</div>
<div class="flex w-full justify-end">
	
	<button
					onclick={handleCopy}
					class="p-2 rounded-md hover:bg-muted transition-colors"
					title="Copy npub"
				>
					<Copy class="size-4" />
				</button>
			</div>
			{/if}