<script lang="ts" context="module">
	import Confirm from '$components/Confirm.svelte';
	import ProjectPermissions from '$components/project/ProjectPermissions.svelte';
	import EnhancedForm from '$components/forms/EnhancedForm.svelte';
	import FormInput from '$components/forms/FormInput.svelte';
	import Spinner from '$components/Spinner.svelte';

	import { drawer } from '$lib/stores/drawer';
	import { toasts } from '$lib/stores/toasts';

	import { generateTodoListSettingsUrl } from '$lib/utils/params/route';
	import { updateUserPermissionsSchema } from '$routes/user/[project_name]-[project_id=integer]/settings/validator.js';
	import { onMount } from 'svelte';
	import type { ActionData, PageData } from './$types';
	import type { PartialUserWithPermission } from '$lib';

	export type Props = {
		form: ActionData;
		data: PageData;
		user: PartialUserWithPermission;
		projectPermissionsRef: ProjectPermissions;
	};
</script>

<script lang="ts">
	const { data, form, user, projectPermissionsRef }: Props = $props();

	let changePermissionsConfirmRef = $state<Confirm | null>();
</script>

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
		<FormInput type="hidden" wrapperClasses="hidden" name="user_id" value={user.id}></FormInput>
		{#each projectPermissionsRef.selectedPermissions as permission}
			<FormInput name="permissions[]" value={permission} type="hidden" wrapperClasses="hidden"
			></FormInput>
		{/each}
	{/snippet}
	{#snippet actions({ loading })}
		<Spinner visible={loading}></Spinner>
		<button
			class="btn btn-warning flex-1"
			onclick={(e) => {
				projectPermissionsRef.reset();
			}}
			type="button"
		>
			cancel
		</button>
		<button
			type="button"
			class="btn btn-success flex-1"
			onclick={() => {
				changePermissionsConfirmRef?.show();
			}}
		>
			save changes
		</button>
		<Confirm bind:this={changePermissionsConfirmRef} confirmButtonType="submit"></Confirm>
	{/snippet}
</EnhancedForm>
