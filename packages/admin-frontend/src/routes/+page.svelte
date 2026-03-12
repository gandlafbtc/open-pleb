<script lang="ts">
	import InviteCodes from '$lib/components/InviteCodes.svelte';
	import * as Card from '$lib/components/ui/card';
</script>

<div class="container mx-auto space-y-8 py-8">
	<Card.Root>
		<Card.Header>
			<Card.Title>Admin Dashboard</Card.Title>
			<Card.Description>
				Manage your application settings and generate invite codes
			</Card.Description>
		</Card.Header>
	</Card.Root>

	<InviteCodes />
</div>
