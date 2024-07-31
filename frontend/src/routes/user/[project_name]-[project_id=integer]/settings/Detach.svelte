<script lang="ts" context="module">
	import Confirm from '$components/Confirm.svelte';
	import EnhancedForm from '$components/forms/EnhancedForm.svelte';
	import FormInput from '$components/forms/FormInput.svelte';
	import Spinner from '$components/Spinner.svelte';

	import { generateTodoListSettingsUrl } from '$lib/utils/params/route';
	import { detachSchema } from '$routes/user/[project_name]-[project_id=integer]/settings/validator.js';
	import type { ActionData, PageData } from './$types';
	import type { PartialUserWithPermission } from '$lib';
	import { getToastManager } from '$lib/stores';

	export type Props = {
		form: ActionData;
		data: PageData;
		user: PartialUserWithPermission;
	};
</script>

<script lang="ts">
	const { data, form, user }: Props = $props();

	let detachProjectConfirmRef = $state<Confirm | null>();
	const toastManagerStore = getToastManager();
</script>

<EnhancedForm
	action="{generateTodoListSettingsUrl(data.currentProject.title, data.currentProject.id)}?/detach"
	enhancerConfig={{
		form: form,
		validator: { schema: detachSchema },
		actionName: 'detach'
	}}
	onSubmitSucceeded={() => {
		toastManagerStore.addToast({
			message: 'project detached from user',
			type: 'success',
			time: 5000
		});
	}}
	onSubmitFailed={(e) => {
		toastManagerStore.addToast({
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
		<FormInput type="hidden" wrapperClasses="hidden" name="projectId" value={data.currentProject.id}
		></FormInput>
		<FormInput type="hidden" wrapperClasses="hidden" name="userId" value={user.id}></FormInput>
	{/snippet}
	{#snippet actions({ loading })}
		<Spinner visible={loading}></Spinner>
		<button
			class="btn btn-error"
			type="button"
			onclick={() => {
				detachProjectConfirmRef?.show();
			}}
		>
			detach
		</button>
		<Confirm bind:this={detachProjectConfirmRef} confirmButtonType="submit"></Confirm>
	{/snippet}
</EnhancedForm>
