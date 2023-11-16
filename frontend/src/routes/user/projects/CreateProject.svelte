<script lang="ts">
	import type { ActionData } from './$types';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import Error from '$components/Error.svelte';
	import { getFormErrors, superEnhance } from '$lib/enhance/form';
	import { createProjectSchema } from './validator';
	import { invalidate } from '$app/navigation';

	export let form: ActionData;

	let formElement: HTMLFormElement;
	let firstInputElement: FormInput;

	$: formErrors = getFormErrors(form);
	let isCreateProjectSubmitting = false;

	function resetForm() {
		formElement.reset();
		formErrors = { errors: undefined, message: undefined };
		firstInputElement.focus();
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
	}}
	on:submitstarted={() => {
		isCreateProjectSubmitting = true;
	}}
	on:submitstarted={() => {
		isCreateProjectSubmitting = false;
	}}
	on:submitsucceeded={async (e) => {
		await invalidate('/user/projects'); // TODO: use stores/ruins later
		resetForm();
	}}
	bind:this={formElement}
	method="post"
	class="card flex w-full flex-row items-start justify-center bg-base-300"
>
	<div class="card-body items-center text-center">
		<Error message={formErrors?.message} />
		<FormInput
			bind:this={firstInputElement}
			name="title"
			class="w-full"
			hideLabel={true}
			errors={formErrors?.errors?.title}
		/>
		<FormInput
			name="description"
			class="w-full"
			hideLabel={true}
			errors={formErrors?.errors?.description}
		/>
		<div class="card-actions w-full justify-end">
			<LoadingButton
				text="add"
				class="flex-auto"
				type="submit"
				loading={isCreateProjectSubmitting}
			/>
			<LoadingButton text="reset" class="btn-warning" type="button" on:click={resetForm} />
		</div>
	</div>
</form>
