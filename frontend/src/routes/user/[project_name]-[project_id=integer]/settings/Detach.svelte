<script lang="ts" module>
	import Confirm from '#lib/components/Confirm.svelte';
	import EnhancedForm from '#lib/components/forms/EnhancedForm.svelte';
	import FormInput from '#lib/components/forms/FormInput.svelte';
	import Spinner from '#lib/components/Spinner.svelte';

	import { generateTodoListSettingsUrl } from '#lib/utils/params/route.js';
	import { detachSchema } from './validator';
	import type { ActionData, PageData } from './$types';
	import type { PartialUserWithPermission } from '#lib';
	import { getToastManager } from '#lib/stores/index.js';
	import type { ComponentExports } from '#lib/utils/types/svelte.js';

	export type Props = {
		form: ActionData;
		data: PageData;
		user: PartialUserWithPermission;
	};
</script>

<script lang="ts">
	const { data, form, user }: Props = $props();

	let detachProjectConfirmRef = $state<ComponentExports<typeof Confirm> | null>();
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
		<FormInput
			type="hidden"
			wrapperClasses="hidden"
			name="project_id"
			value={data.currentProject.id}
		></FormInput>
		<FormInput type="hidden" wrapperClasses="hidden" name="user_id" value={user.id}></FormInput>
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
