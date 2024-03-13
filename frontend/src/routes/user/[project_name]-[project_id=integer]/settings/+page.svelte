<script lang="ts" context="module">
	import NavbarItem from '$components/navbar/NavbarItem.svelte';

	import type { SnippetParams as DrawerSnippetParams } from '$components/Drawer.svelte';

	import { page } from '$app/stores';
	import { drawer } from '$lib/stores/drawer';

	import { generateTodoListSettingsUrl, generateTodoListUrl } from '$lib/utils/params/route';
	import { faClose, faGear } from '@fortawesome/free-solid-svg-icons';
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
		href={generateTodoListUrl($page.params.project_name, $page.params.project_id)}
		name=""
		icon={faClose}
	/>
{/snippet}
