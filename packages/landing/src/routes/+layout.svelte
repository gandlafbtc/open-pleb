<script lang="ts">
    import type { Snippet } from 'svelte';
    import "../app.css";
    import type { LayoutData } from './$types';
    let { data, children }: { data: LayoutData, children: Snippet } = $props();
</script>

{@render children()}