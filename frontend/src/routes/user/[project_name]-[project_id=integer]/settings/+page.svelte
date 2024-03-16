<script lang="ts" context="module">
	import NavbarItem from '$components/navbar/NavbarItem.svelte';
	import ProjectPermissions from '$components/project/ProjectPermissions.svelte';

	import type { SnippetParams as DrawerSnippetParams } from '$components/Drawer.svelte';

	import { drawer } from '$lib/stores/drawer';

	import { generateTodoListSettingsUrl, generateTodoListUrl } from '$lib/utils/params/route';
	import { faClose } from '@fortawesome/free-solid-svg-icons';
	import { onMount } from 'svelte';
</script>

<script lang="ts">
	import EnhancedForm from '$components/forms/EnhancedForm.svelte';
	import FormInput from '$components/forms/FormInput.svelte';
	import { detachSchema } from '$routes/user/[project_name]-[project_id=integer]/settings/validator.js';

	const { data, form } = $props();

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
						<EnhancedForm
							action="{generateTodoListSettingsUrl(
								data.currentProject.title,
								data.currentProject.id
							)}?/detach"
							enhancerConfig={{
								form: form,
								validate: { schema: detachSchema },
								action: 'detach'
							}}
						>
							{#snippet inputs()}
								<FormInput type="hidden" wrapperClasses="hidden" name="project_id" value={data.currentProject.id}
								></FormInput>
								<FormInput type="hidden" wrapperClasses="hidden" name="user_id" value={user.id}></FormInput>
							{/snippet}
							{#snippet actions()}
								<button class="btn btn-error"> detach </button>
							{/snippet}
						</EnhancedForm>
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
