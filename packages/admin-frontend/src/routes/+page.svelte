<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card';
</script>

<div class="container mx-auto space-y-8 py-8">
	<Card.Root>
		<Card.Header>
			<Card.Title>Manage users and invites</Card.Title>
			<Card.Description>
			</Card.Description>
			<Button href="/user">
				Manage users
			</Button>
		</Card.Header>
	</Card.Root>
	<Card.Root>
		<Card.Header>
			<Card.Title>Manage providers</Card.Title>
			<Card.Description>
			</Card.Description>
			<Button href="/providers">
				Manage providers
			</Button>
		</Card.Header>
	</Card.Root>
</div>
