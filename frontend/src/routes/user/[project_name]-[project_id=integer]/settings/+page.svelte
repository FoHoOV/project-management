<script lang="ts" module>
	import NavbarItem from '$components/navbar/NavbarItem.svelte';
	import ProjectPermissions from '$components/project/ProjectPermissions.svelte';
	import SaveChanges from '$routes/user/[project_name]-[project_id=integer]/settings/SaveChanges.svelte';
	import Detach from '$routes/user/[project_name]-[project_id=integer]/settings/Detach.svelte';
	import UserInfo from '$routes/user/[project_name]-[project_id=integer]/settings/UserInfo.svelte';

	import { generateTodoListItemsUrl } from '$lib/utils/params/route';
	import { faClose } from '@fortawesome/free-solid-svg-icons';
	import { onMount } from 'svelte';
	import { getNavbar } from '$lib/stores/index.js';
	import type { ComponentExports } from '$lib/utils/types/svelte.js';
</script>

<script lang="ts">
	const { data, form } = $props();

	let projectPermissionsRefs = $state<ComponentExports<typeof ProjectPermissions>[]>([]);
	const navbarStore = getNavbar();

	const showConfirmChanges = $derived.by(() => {
		return data.currentProject.users.map((user, i) => {
			if (i >= projectPermissionsRefs.length) {
				return false; // ref are not bound yet
			}
			return (
				projectPermissionsRefs[i].getSelectedPermissions().size !== user.permissions.length ||
				![...projectPermissionsRefs[i].getSelectedPermissions()].every((iv) =>
					user.permissions.includes(iv)
				)
			);
		});
	});

	navbarStore.add('end', closeSettings);

	onMount(() => {
		return () => {
			navbarStore.remove('end', closeSettings);
		};
	});
</script>

<svelte:head>
	<title>todos settings</title>
</svelte:head>

{#snippet closeSettings()}
	<NavbarItem
		href={generateTodoListItemsUrl(data.currentProject.title, data.currentProject.id)}
		name=""
		icon={faClose}
	/>
{/snippet}

<div class="rounded-sm p-1">
	<h1 class="mb-5 text-lg text-info">Accessibility</h1>
	{#each data.currentProject.users as user, i (user.id)}
		<div
			class="collapse relative mb-2 bg-base-200 shadow-sm"
			data-testid="user-permissions-wrapper"
		>
			<input type="checkbox" class="peer" />
			<div
				class="collapse-title static flex flex-col justify-between gap-3 pe-4 sm:flex-row sm:items-center sm:gap-0"
			>
				<UserInfo {user} token={data.token!}></UserInfo>
				<div class="z-10 flex gap-2">
					{#if showConfirmChanges[i]}
						<SaveChanges
							{data}
							{form}
							{user}
							getSelectedPermissions={projectPermissionsRefs[i].getSelectedPermissions}
							resetSelectedPermissions={projectPermissionsRefs[i].reset}
						></SaveChanges>
					{:else}
						<Detach {data} {form} {user}></Detach>
					{/if}
				</div>
			</div>
			<div class="collapse-content z-auto">
				<ProjectPermissions
					bind:this={projectPermissionsRefs[i]}
					preCheckedPermissions={user.permissions}
				></ProjectPermissions>
			</div>
		</div>
	{/each}
</div>
