<script lang="ts">
	let count = $state(0);

	function increment() {
		count++;
	}
</script>

<button onclick={increment} class="increment-button">
	Count: {count}
</button>

<style>
	.increment-button {
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
		font-weight: 600;
		color: white;
		background-color: #3b82f6;
		border: none;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.increment-button:hover {
		background-color: #2563eb;
	}

	.increment-button:active {
		background-color: #1d4ed8;
	}
</style>
