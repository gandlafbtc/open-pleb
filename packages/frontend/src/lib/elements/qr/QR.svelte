<script lang="ts">
	import BigTokenQR from './BigTokenQR.svelte';
	import QRCode from './QRCode.svelte';

	interface Props {
		data: string;
	}

	let { data }: Props = $props();
</script>

{#if data.length > 500}
	<BigTokenQR size={[7]} speed={[7]} token={data} />
{:else}
	<QRCode {data} />
{/if}
