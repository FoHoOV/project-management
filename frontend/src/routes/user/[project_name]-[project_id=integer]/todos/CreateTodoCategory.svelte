<script lang="ts">
	import type { ActionData } from './$types';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import Alert from '$components/Alert.svelte';
	import { getFormErrors, superEnhance } from '$lib/enhance/form';
	import todos from '$lib/stores/todos';
	import { createTodoCategorySchema } from './validator';
	import { page } from '$app/stores';

	export let form: ActionData;

	let formElement: HTMLFormElement;

	$: formErrors = getFormErrors(form);

	let isCreateTodoCategorySubmitting = false;
	let isFormSubmitSuccessful = false;

	function resetForm() {
		formElement.reset();
		formErrors = { errors: undefined, message: undefined };
		isFormSubmitSuccessful = false;
	}
</script>

<form
	action="/user/{$page.params.project_name}-{$page.params.project_id}/todos?/createCategory"
	use:superEnhance={{
		validator: { schema: createTodoCategorySchema },
		form: form,
		action: 'createCategory'
	}}
	on:submitclienterror={(e) => {
		formErrors = {
			errors: e.detail,
			message: 'Invalid form, please review your inputs'
		};
		isFormSubmitSuccessful = false;
	}}
	on:submitstarted={() => {
		isCreateTodoCategorySubmitting = true;
		isFormSubmitSuccessful = false;
	}}
	on:submitended={() => {
		isCreateTodoCategorySubmitting = false;
	}}
	on:submitsucceeded={(e) => {
		todos.addCategory(e.detail.response);
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
			message={isFormSubmitSuccessful ? 'category created!' : ''}
		/>
		<Alert class="mb-1" type="error" message={formErrors?.message} />
		<FormInput
			class="hidden"
			type="hidden"
			name="project_id"
			value={$page.params.project_id}
			errors={''}
		/>
		<FormInput name="title" class="w-full" hideLabel={true} errors={formErrors?.errors?.title} />
		<FormInput
			name="description"
			class="w-full"
			hideLabel={true}
			errors={formErrors?.errors?.description}
		/>
		<div class="card-actions mt-1 w-full justify-end">
			<LoadingButton
				text="add"
				class="btn-success flex-1"
				type="submit"
				loading={isCreateTodoCategorySubmitting}
			/>
			<LoadingButton text="reset" class="btn-warning flex-1" type="button" on:click={resetForm} />
		</div>
	</div>
</form>
