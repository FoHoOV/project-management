<script lang="ts" module>
	import Confirm from '#lib/components/Confirm.svelte';
	import ProjectPermissions from '#lib/components/project/ProjectPermissions.svelte';
	import EnhancedForm from '#lib/components/forms/EnhancedForm.svelte';
	import FormInput from '#lib/components/forms/FormInput.svelte';
	import Spinner from '#lib/components/Spinner.svelte';

	import { generateTodoListSettingsUrl } from '#lib/utils/params/route.js';
	import { updateUserPermissionsSchema } from './validator';

	import type { ActionData, PageData } from './$types';
	import type { PartialUserWithPermission, Permission } from '#lib';
	import { getToastManager } from '#lib/stores/index.js';
	import type { SvelteSet } from 'svelte/reactivity';
	import type { ComponentExports } from '#lib/utils/types/svelte.js';

	export type Props = {
		form: ActionData;
		data: PageData;
		user: PartialUserWithPermission;
		getSelectedPermissions: () => SvelteSet<Permission>;
		resetSelectedPermissions: () => void;
	};
</script>

<script lang="ts">
	const { data, form, user, getSelectedPermissions, resetSelectedPermissions }: Props = $props();

	let changePermissionsConfirmRef = $state<ComponentExports<typeof Confirm> | null>();
	const toastsMangerStore = getToastManager();
</script>

<EnhancedForm
	action="{generateTodoListSettingsUrl(
		data.currentProject.title,
		data.currentProject.id
	)}?/updatePermissions"
	enhancerConfig={{
		form: form,
		validator: { schema: updateUserPermissionsSchema },
		actionName: 'updatePermissions'
	}}
	onSubmitSucceeded={() => {
		toastsMangerStore.addToast({
			message: 'project permissions updated',
			type: 'success',
			time: 5000
		});
	}}
	onSubmitFailed={(e) => {
		toastsMangerStore.addToast({
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
		{#each getSelectedPermissions() as permission (permission)}
			<FormInput name="permissions[]" value={permission} type="hidden" wrapperClasses="hidden"
			></FormInput>
		{/each}
	{/snippet}
	{#snippet actions({ loading })}
		<Spinner visible={loading}></Spinner>
		<button
			class="btn btn-warning flex-1"
			onclick={(e) => {
				resetSelectedPermissions();
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
