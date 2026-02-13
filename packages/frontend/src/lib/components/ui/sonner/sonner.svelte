<script lang="ts">
	import CircleCheckIcon from "@lucide/svelte/icons/circle-check";
	import InfoIcon from "@lucide/svelte/icons/info";
	import Loader2Icon from "@lucide/svelte/icons/loader-2";
	import OctagonXIcon from "@lucide/svelte/icons/octagon-x";
	import TriangleAlertIcon from "@lucide/svelte/icons/triangle-alert";

	import { Toaster as Sonner, type ToasterProps as SonnerProps } from "svelte-sonner";
	import { mode } from "mode-watcher";

	let { ...restProps }: SonnerProps = $props();
</script>

<Sonner
	theme={mode.current}
	class="toaster group"
	style="--normal-bg: var(--color-popover); --normal-text: var(--color-popover-foreground); --normal-border: var(--color-border);"
	{...restProps}
	>{#snippet loadingIcon()}
		<Loader2Icon class="size-4 animate-spin" />
	{/snippet}
	{#snippet successIcon()}
		<CircleCheckIcon class="size-4" />
	{/snippet}
	{#snippet errorIcon()}
		<OctagonXIcon class="size-4" />
	{/snippet}
	{#snippet infoIcon()}
		<InfoIcon class="size-4" />
	{/snippet}
	{#snippet warningIcon()}
		<TriangleAlertIcon class="size-4" />
	{/snippet}
</Sonner>

<!-- hack: makes it work in build -->
<style lang="postcss">
	:global([data-rich-colors='true'] [data-sonner-toast][data-type='success']) {
		background: var(--success-bg) !important;
		border: 1px solid var(--success-border) !important;
		color: var(--success-text) !important;
	}
	:global([data-theme='dark'] [data-sonner-toast][data-type='default'] [data-close-button]) {
		background: var(--normal-bg) !important;
		border: 1px solid var(--normal-border) !important;
		color: var(--normal-text) !important;
	}
	:global([data-rich-colors='true'] [data-sonner-toast][data-type='success'] [data-close-button]) {
		background: var(--success-bg) !important;
		border: 1px solid var(--success-border) !important;
		color: var(--success-text) !important;
	}
	:global(
		[data-rich-colors='true'] [data-sonner-toast][data-type='info'],
		[data-rich-colors='true'] [data-sonner-toast][data-type='info'] [data-close-button]
	) {
		background: var(--info-bg) !important;
		border: 1px solid var(--info-border) !important;
		color: var(--info-text) !important;
	}
	:global(
		[data-rich-colors='true'] [data-sonner-toast][data-type='warning'],
		[data-rich-colors='true'] [data-sonner-toast][data-type='warning'] [data-close-button]
	) {
		background: var(--warning-bg) !important;
		border: 1px solid var(--warning-border) !important;
		color: var(--warning-text) !important;
	}
	:global(
		[data-rich-colors='true'] [data-sonner-toast][data-type='error'],
		[data-rich-colors='true'] [data-sonner-toast][data-type='error'] [data-close-button]
	) {
		background: var(--error-bg) !important;
		border: 1px solid var(--error-border) !important;
		color: var(--error-text) !important;
	}
</style>
