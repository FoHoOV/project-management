<script lang="ts" module>
	import { type PartialUserWithPermission } from '$lib';
	import { Permission } from '$lib/generated-client';

	export type Props = {
		user: PartialUserWithPermission;
		currentUsername: string;
	};
</script>

<script lang="ts">
	const { user, currentUsername }: Props = $props();
</script>

<div class="flex items-center gap-1">
	<span class="text-sm"> username: </span>
	<span class="font-bold">
		{user.username}
	</span>
	{#if user.permissions.indexOf(Permission.ALL) != -1}
		<span class="text-sm text-success">(owner)</span>
	{/if}
	{#if currentUsername == user.username}
		<span class="text-sm text-warning">(myself)</span>
	{/if}
</div>
