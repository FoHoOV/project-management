<script lang="ts">
	import type { ActionData } from './$types';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import Alert from '$components/Alert.svelte';
	import { getFormErrors, superEnhance } from '$lib/actions/form';
	import { createProjectSchema } from './validator';
	import { invalidate } from '$app/navigation';

	export let form: ActionData;

	let formElement: HTMLFormElement;

	$: formErrors = getFormErrors(form);
	let isCreateProjectSubmitting = false;
	let isFormSubmitSuccessful = false;

	function resetForm() {
		formElement.reset();
		formErrors = { errors: undefined, message: undefined };
		isFormSubmitSuccessful = false;
	}
</script>

<form
	action="/user/projects?/create"
	use:superEnhance={{
		validator: { schema: createProjectSchema },
		form: form,
		action: 'create'
	}}
	on:submitclienterror={(e) => {
		formErrors = {
			errors: e.detail,
			message: 'Invalid form, please review your inputs'
		};
		isFormSubmitSuccessful = false;
	}}
	on:submitstarted={() => {
		isCreateProjectSubmitting = true;
		isFormSubmitSuccessful = false;
	}}
	on:submitended={() => {
		isCreateProjectSubmitting = false;
	}}
	on:submitsucceeded={async (e) => {
		// based on docs and on how invalidate works this doesn't do shit
		await invalidate('/user/projects'); // TODO: use stores/runes later
		resetForm();
		isFormSubmitSuccessful = true;
	}}
	bind:this={formElement}
	method="post"
	class="card flex w-full flex-row items-start justify-center bg-base-300"
>
	<div class="card-body items-center text-center">
		<Alert class="mb-1" type="success" message={isFormSubmitSuccessful ? 'project created!' : ''} />
		<Alert class="mb-1" type="error" message={formErrors?.message} />
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
				loading={isCreateProjectSubmitting}
			/>
			<LoadingButton text="reset" class="btn-warning flex-1" type="button" on:click={resetForm} />
		</div>
	</div>
</form>
