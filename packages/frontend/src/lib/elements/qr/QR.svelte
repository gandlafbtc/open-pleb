<script lang="ts">
	import BigTokenQR from './BigTokenQR.svelte';
	import QRCode from './QRCode.svelte';

	interface Props {
		data: string;
	}

	let { data }: Props = $props();
</script>

{#if data.length > 300}
	<BigTokenQR size={[3]} speed={[3]} token={data} />
{:else}
	<QRCode {data} />
{/if}
