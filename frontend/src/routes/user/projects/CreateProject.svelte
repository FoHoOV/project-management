<script context="module" lang="ts">
	export type Props = {
		form: ActionData;
	};
</script>

<script lang="ts">
	import type { ActionData } from './$types';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import Alert from '$components/Alert.svelte';
	import { getFormErrors, superEnhance } from '$lib/actions/form';
	import { createProjectSchema } from './validator';
	import projects from '$lib/stores/projects';

	const { form } = $props<Props>();

	let formElement = $state<HTMLFormElement | null>(null);

	let componentState = $state<'submitting' | 'submit-successful' | 'none'>('none');

	let formErrors = $state(getFormErrors(form));

	function resetForm() {
		formElement?.reset();
		formErrors = { errors: undefined, message: undefined };
		componentState = 'none';
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
		componentState = 'none';
	}}
	on:submitstarted={() => {
		componentState = 'submitting';
	}}
	on:submitended={() => {
		componentState = 'none';
	}}
	on:submitsucceeded={async (e) => {
		projects.addProject(e.detail.response);
		resetForm();
		componentState = 'submit-successful';
	}}
	bind:this={formElement}
	method="post"
	class="card flex w-full flex-row items-start justify-center bg-base-300"
>
	<div class="card-body items-center text-center">
		<Alert
			class="mb-1"
			type="success"
			message={componentState == 'submit-successful' ? 'project created!' : ''}
		/>
		<Alert class="mb-1" type="error" message={formErrors?.message} />
		<FormInput name="title" class="w-full" autoFocus={true} errors={formErrors?.errors?.title} />
		<FormInput
			name="description"
			label="description (Optional)"
			class="w-full"
			errors={formErrors?.errors?.description}
		/>
		<FormInput
			name="create_from_default_template"
			label="Create from default template?"
			type="checkbox"
			value={true}
			class="w-full !flex-row items-center !justify-start gap-3"
			inputClasses="!checkbox !btn-square !checkbox-success"
			errors={formErrors.errors?.create_from_default_template?.toString()}
		/>
		<div class="card-actions mt-1 w-full justify-end">
			<LoadingButton text="reset" class="btn-warning flex-1" type="button" on:click={resetForm} />
			<LoadingButton
				text="create"
				class="btn-success flex-1"
				type="submit"
				loading={componentState == 'submitting'}
			/>
		</div>
	</div>
</form>
