<script lang="ts" context="module">
	import NavbarItem from '$components/navbar/NavbarItem.svelte';

	import type { SnippetParams as DrawerSnippetParams } from '$components/Drawer.svelte';

	import { drawer } from '$lib/stores/drawer';

	import { generateTodoListUrl } from '$lib/utils/params/route';
	import { faClose } from '@fortawesome/free-solid-svg-icons';
	import { onMount } from 'svelte';
</script>

<script lang="ts">
	const { data } = $props();

	onMount(() => {
		drawer.navbar.end.push(closeSettings);

		return () => {
			drawer.navbar.remove('end', closeSettings);
		};
	});
</script>

<svelte:head>
	<title>todos settings</title>
</svelte:head>

{#snippet closeSettings({ closeDrawer }: DrawerSnippetParams[0])}
	<NavbarItem
		href={generateTodoListUrl(data.currentProject.title, data.currentProject.id)}
		name=""
		icon={faClose}
	/>
{/snippet}

{#each data.currentProject.users as user}
	<span>accessed by</span>
	<span>{user.username}</span>
	<span>permissions</span>
	{#each user.permissions as permission}
		<span>{permission}</span>
	{/each}
{/each}
