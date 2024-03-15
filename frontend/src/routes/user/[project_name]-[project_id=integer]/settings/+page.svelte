<script lang="ts" context="module">
	import NavbarItem from '$components/navbar/NavbarItem.svelte';
	import ProjectPermissions from '$components/project/ProjectPermissions.svelte';

	import type { SnippetParams as DrawerSnippetParams } from '$components/Drawer.svelte';

	import { drawer } from '$lib/stores/drawer';

	import { generateTodoListUrl } from '$lib/utils/params/route';
	import { faClose } from '@fortawesome/free-solid-svg-icons';
	import { onMount } from 'svelte';
</script>

<script lang="ts">
	const { data } = $props();

	let showConfirmChanges = $state<boolean[]>(
		new Array<boolean>(data.currentProject.users.length).fill(false)
	);

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

<div class="rounded-sm p-1">
	<h1 class="mb-5 text-lg text-info">Accessibility</h1>
	{#each data.currentProject.users as user, i}
		<div class="collapse mb-2 bg-neutral text-neutral-content">
			<input type="checkbox" class="peer" />
			<div class="collapse-title flex items-center justify-between">
				<div>
					<span class="text-sm"> username: </span>
					<span class="font-bold">
						{user.username}
					</span>
				</div>
				<div class="z-50 flex gap-2">
					{#if showConfirmChanges[i]}
						<button
							class="btn btn-warning z-50 flex-1"
							onclick={(e) => {
								showConfirmChanges[i] = false;
							}}
						>
							cancel
						</button>
						<button class="btn btn-success flex-1"> save changes </button>
					{:else}
						<button class="btn btn-error"> detach </button>
					{/if}
				</div>
			</div>
			<div class="collapse-content z-50">
				<ProjectPermissions
					preCheckedPermissions={user.permissions}
					onChange={() => {
						showConfirmChanges[i] = true;
					}}
				></ProjectPermissions>
			</div>
		</div>
	{/each}
</div>
