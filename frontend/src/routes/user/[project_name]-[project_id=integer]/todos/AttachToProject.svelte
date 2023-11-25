<script lang="ts">
	import type { ActionData } from './$types';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import Alert from '$components/Alert.svelte';
	import { getFormErrors, superEnhance } from '$lib/enhance/form';
	import { attachToProjectSchema } from './validator';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';

	export let form: ActionData;
	export let categoryId: number;

	let formElement: HTMLFormElement;

	$: formErrors = getFormErrors(form);
	let isAttachProjectSubmitting = false;
	let isFormSubmitSuccessful = false;

	function resetForm() {
		formElement.reset();
		formErrors = { errors: undefined, message: undefined };
		isFormSubmitSuccessful = false;
	}
</script>

<form
	action="/user/{$page.params.project_name}-{$page.params.project_id}/todos?/attachToProject"
	use:superEnhance={{
		validator: { schema: attachToProjectSchema },
		form: form,
		action: 'attachToProject'
	}}
	on:submitclienterror={(e) => {
		formErrors = {
			errors: e.detail,
			message: 'Invalid form, please review your inputs'
		};
		isFormSubmitSuccessful = false;
	}}
	on:submitstarted={() => {
		isAttachProjectSubmitting = true;
		isFormSubmitSuccessful = false;
	}}
	on:submitended={() => {
		isAttachProjectSubmitting = false;
	}}
	on:submitsucceeded={async () => {
		// based on docs and on how invalidate works this doesn't do shit
		await invalidate(`/user/{$page.params.project_name}-{$page.params.project_id}/todos`); // TODO: use stores/runes later
		resetForm();
		isFormSubmitSuccessful = true;
	}}
	bind:this={formElement}
	method="post"
	class="card flex w-full flex-row items-start justify-center bg-base-300"
>
	<div class="card-body items-center text-center">
		<Alert
			class="mb-1"
			type="success"
			message={isFormSubmitSuccessful ? 'attached to project!' : ''}
		/>
		<Alert class="mb-1" type="error" message={formErrors?.message} />
		<FormInput
			name="category_id"
			class="w-full"
			hideLabel={true}
			value={categoryId}
			errors={''}
			type="hidden"
		/>
		<FormInput
			name="project_id"
			label="project id"
			class="w-full"
			hideLabel={true}
			errors={typeof formErrors?.errors?.project_id === 'number'
				? formErrors.errors.project_id.toString()
				: formErrors?.errors?.project_id}
		/>
		<div class="card-actions mt-1 w-full justify-end">
			<LoadingButton
				text="add"
				class="btn-success flex-1"
				type="submit"
				loading={isAttachProjectSubmitting}
			/>
			<LoadingButton text="reset" class="btn-warning flex-1" type="button" on:click={resetForm} />
		</div>
	</div>
</form>
