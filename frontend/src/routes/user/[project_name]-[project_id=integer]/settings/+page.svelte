<script lang="ts" context="module">
	import Confirm from '$components/Confirm.svelte';
	import NavbarItem from '$components/navbar/NavbarItem.svelte';
	import ProjectPermissions from '$components/project/ProjectPermissions.svelte';
	import EnhancedForm from '$components/forms/EnhancedForm.svelte';
	import FormInput from '$components/forms/FormInput.svelte';
	import Spinner from '$components/Spinner.svelte';

	import type { SnippetParams as DrawerSnippetParams } from '$components/Drawer.svelte';

	import { drawer } from '$lib/stores/drawer';
	import { toasts } from '$lib/stores/toasts/toasts.svelte.js';

	import { Permission } from '$lib';
	import { generateTodoListSettingsUrl, generateTodoListItemsUrl } from '$lib/utils/params/route';
	import {
		detachSchema,
		updateUserPermissionsSchema
	} from '$routes/user/[project_name]-[project_id=integer]/settings/validator.js';
	import { faClose } from '@fortawesome/free-solid-svg-icons';
	import { onMount } from 'svelte';
</script>

<script lang="ts">
	const { data, form } = $props();

	let showConfirmChanges = $state<boolean[]>(
		new Array<boolean>(data.currentProject.users.length).fill(false)
	);
	let projectPermissionsRefs = $state<ProjectPermissions[]>([]);
	let changePermissionsConfirmRefs = $state<Confirm[]>([]);
	let detachProjectConfirmRefs = $state<Confirm[]>([]);

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
		href={generateTodoListItemsUrl(data.currentProject.title, data.currentProject.id)}
		name=""
		icon={faClose}
	/>
{/snippet}

<div class="rounded-sm p-1">
	<h1 class="mb-5 text-lg text-info">Accessibility</h1>
	{#each data.currentProject.users as user, i}
		<div class="collapse relative mb-2 bg-base-200 shadow-sm">
			<input type="checkbox" class="peer" />
			<div
				class="collapse-title static flex flex-col justify-between gap-3 pe-4 sm:flex-row sm:items-center sm:gap-0"
			>
				<div class="flex items-center gap-1">
					<span class="text-sm"> username: </span>
					<span class="font-bold">
						{user.username}
					</span>
					{#if user.permissions.indexOf(Permission.All) != -1}
						<span class="text-sm text-success">(owner)</span>
					{/if}
				</div>
				<div class="z-10 flex gap-2">
					{#if showConfirmChanges[i]}
						<EnhancedForm
							action="{generateTodoListSettingsUrl(
								data.currentProject.title,
								data.currentProject.id
							)}?/updatePermissions"
							enhancerConfig={{
								form: form,
								validator: { schema: updateUserPermissionsSchema },
								action: 'updatePermissions'
							}}
							onSubmitSucceeded={() => {
								toasts.addToast({
									message: 'project permissions updated',
									type: 'success',
									time: 5000
								});
							}}
							onSubmitFailed={(e) => {
								toasts.addToast({
									message: e.error.message ?? 'some errors occurred',
									type: 'error',
									time: 5000
								});
							}}
							successfulMessage=""
							showResetButton={false}
							showErrors={false}
						>
							{#snippet inputs()}
								<FormInput
									type="hidden"
									wrapperClasses="hidden"
									name="project_id"
									value={data.currentProject.id}
								></FormInput>
								<FormInput type="hidden" wrapperClasses="hidden" name="user_id" value={user.id}
								></FormInput>
								{#each projectPermissionsRefs[i].selectedPermissions as permission}
									<FormInput
										name="permissions[]"
										value={permission}
										type="hidden"
										wrapperClasses="hidden"
									></FormInput>
								{/each}
							{/snippet}
							{#snippet actions({ loading })}
								<Spinner visible={loading}></Spinner>
								<button
									class="btn btn-warning flex-1"
									onclick={(e) => {
										projectPermissionsRefs[i].reset();
										showConfirmChanges[i] = false;
									}}
									type="button"
								>
									cancel
								</button>
								<button
									type="button"
									class="btn btn-success flex-1"
									onclick={() => {
										changePermissionsConfirmRefs[i].show();
									}}
								>
									save changes
								</button>
								<Confirm bind:this={changePermissionsConfirmRefs[i]} confirmButtonType="submit"
								></Confirm>
							{/snippet}
						</EnhancedForm>
					{:else}
						<EnhancedForm
							action="{generateTodoListSettingsUrl(
								data.currentProject.title,
								data.currentProject.id
							)}?/detach"
							enhancerConfig={{
								form: form,
								validator: { schema: detachSchema },
								action: 'detach'
							}}
							onSubmitSucceeded={() => {
								toasts.addToast({
									message: 'project detached from user',
									type: 'success',
									time: 5000
								});
							}}
							onSubmitFailed={(e) => {
								toasts.addToast({
									message: e.error.message ?? 'some errors occurred',
									type: 'error',
									time: 5000
								});
							}}
							successfulMessage=""
							showResetButton={false}
							showErrors={false}
						>
							{#snippet inputs()}
								<FormInput
									type="hidden"
									wrapperClasses="hidden"
									name="project_id"
									value={data.currentProject.id}
								></FormInput>
								<FormInput type="hidden" wrapperClasses="hidden" name="user_id" value={user.id}
								></FormInput>
							{/snippet}
							{#snippet actions({ loading })}
								<Spinner visible={loading}></Spinner>
								<button
									class="btn btn-error"
									type="button"
									onclick={() => {
										detachProjectConfirmRefs[i].show();
									}}
								>
									detach
								</button>
								<Confirm bind:this={detachProjectConfirmRefs[i]} confirmButtonType="submit"
								></Confirm>
							{/snippet}
						</EnhancedForm>
					{/if}
				</div>
			</div>
			<div class="collapse-content z-auto">
				<ProjectPermissions
					bind:this={projectPermissionsRefs[i]}
					preCheckedPermissions={user.permissions}
					onChange={(permissions) => {
						showConfirmChanges[i] =
							permissions.size !== user.permissions.length ||
							![...permissions].every((iv) => user.permissions.includes(iv));
					}}
				></ProjectPermissions>
			</div>
		</div>
	{/each}
</div>
