<script>
	import '../style.css';
	const { children } = $props();
	let connected = $state(true);
</script>

<div class="flex w-screen justify-center p-2">
	<div class="flex max-w-4xl justify-between w-full items-center">
		<!-- Main container with orange background -->
		<div class="flex flex-col w-full">
			<!-- App content -->
			<div class="p-6">
				<!-- App header with icon, name, and connect button -->
				<div class="flex justify-between items-center mb-6">
					<div class="flex items-center gap-4">
						<img src="/maskable-icon.png" class="w-36 h-36 rounded-2xl" />
						<div class=" flex flex-col justify-between gap-6">
							<div class="text-xs flex gap-2 items-center">
								{#if connected}
									<div class="rounded-full bg-success w-2 h-2"></div>
									<p class="text-success">Connected</p>
								{/if}
							</div>
							<div class="font-bold text-4xl">OpenPleb</div>
							<div class="text-xs text-neutral-content">OpenPleb 0.1.0-alpha</div>
						</div>
					</div>
				</div>
				{@render children()}
			</div>
		</div>
	</div>
</div>
