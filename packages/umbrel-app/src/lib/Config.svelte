<script lang="ts">
	import type { PageData } from "../routes/$types";

	// Extend PageData to include our configData type
	interface ConfigPageData extends PageData {
		configData: Record<string, string>;
	}

	interface Props {data: ConfigPageData}
	
	const {data}: Props = $props();

	const fileNames = ['frontend/.env', 'backend/.env', 'admin-frontend/.env', 'db/.env'];
	
	// Initialize with either the data or an empty object with keys for each file
	const configContents = $state(data.configData || 
		Object.fromEntries(fileNames.map(name => [name, '']))
	);
	let activeTab = $state(fileNames[0]);
	let saved = $state(false);
	let error = $state('');
	let isSubmitting = $state(false);

	// Reset notification after a delay
	function resetNotifications() {
		setTimeout(() => {
			saved = false;
			error = '';
		}, 3000);
	}

	// Custom form submission handler to prevent page reload
	async function handleSubmit() {
		isSubmitting = true;
		try {
			const response = await fetch('/api/configure', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({files: configContents})
			});
			
			const result = await response.json();
			
			if (result.success) {
				saved = true;
			} else {
				error = result.error || 'Failed to save configuration';
			}
		} catch (err) {
			console.error('Error submitting form:', err);
			error = 'Failed to save configuration';
		} finally {
			isSubmitting = false;
			resetNotifications();
		}
	}

	function setActiveTab(fileName: string) {
		activeTab = fileName;
	}
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="text-2xl font-bold mb-6">Configure Open pleb</h1>
	
	<div class="mb-6">
		<p class="text-gray-600 mb-4">
			Edit the configuration files below.
		</p>
	</div>

	{#if saved}
	<div role="alert" class="alert alert-success">
		<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
		  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
		<span>Configuration updated successfully!</span>
	  </div>
	{/if}

	{#if error}
	<div role="alert" class="alert alert-error">
		<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
		  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
		<p>Error: {error}</p>
	  </div>
	{/if}

	<div class="tabs tabs-boxed mb-4">
		{#each fileNames as fileName}
			<button 
				class="tab {activeTab === fileName ? 'tab-active' : ''}" 
				onclick={() => setActiveTab(fileName)}
			>
				{fileName}
			</button>
		{/each}
	</div>

	<div class="mb-4">
		<label for="configContent" class="block text-gray-700 text-sm font-bold mb-2">
			Configuration: {activeTab}
		</label>
		<textarea
			id="configContent"
			name="configContent"
			bind:value={configContents[activeTab]}
			class="w-full h-96 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
			spellcheck="false"
		></textarea>
	</div>

	<div class="flex justify-end">
		<button
			class="btn btn-primary"
			disabled={isSubmitting}
			onclick={()=>{
				  handleSubmit()
			}}
			>
			{#if isSubmitting}
				Saving...
			{:else}
				Save All Configurations
			{/if}
		</button>
	</div>
</div>
