<script lang="ts" context="module">
	import { type PartialUserWithPermission, type Token, getUsername } from '$lib';
	import { Permission } from '$lib/generated-client/models';

	export type Props = {
		user: PartialUserWithPermission;
		token: Token;
	};
</script>

<script lang="ts">
	const { user, token }: Props = $props();
</script>

<div class="flex items-center gap-1">
	<span class="text-sm"> username: </span>
	<span class="font-bold">
		{user.username}
	</span>
	{#if user.permissions.indexOf(Permission.All) != -1}
		<span class="text-sm text-success">(owner)</span>
	{/if}
	{#if getUsername(token.access_token) == user.username}
		<span class="text-sm text-warning">(myself)</span>
	{/if}
</div>
