<script lang="ts">
	import type { ActionData } from './$types';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import Error from '$components/Error.svelte';
	import { getFormErrors, superEnhance } from '$lib/enhance/form';
	import todos from '$lib/stores/todos';
	import { createTodoCategorySchema } from './validator';

	export let form: ActionData;

	let formElement: HTMLFormElement;
	let firstInputElement: FormInput;

	$: formErrors = getFormErrors(form);
	let isCreateTodoCategorySubmitting = false;

	function resetForm() {
		formElement.reset();
		formErrors = { errors: undefined, message: undefined };
		firstInputElement.focus();
	}
</script>

<form
	action="/user/todos?/createCategory"
	use:superEnhance={{ validator: { schema: createTodoCategorySchema }, form: form }}
	on:submitclienterror={(e) => {
		formErrors = {
			errors: e.detail,
			message: 'Invalid form, please review your inputs'
		};
	}}
	on:submitstarted={() => {
		isCreateTodoCategorySubmitting = true;
	}}
	on:submitstarted={() => {
		isCreateTodoCategorySubmitting = false;
	}}
	on:submitsucceeded={(e) => {
		todos.addCategory(e.detail.response);
		resetForm();
	}}
	bind:this={formElement}
	method="post"
	class="flex w-full items-start justify-center card bg-base-300 flex-row"
>
	<div class="card-body items-center text-center">
		<Error message={formErrors?.message} />
		<FormInput bind:this={firstInputElement} name="title" class="w-full" hideLabel={true} errors={formErrors?.errors?.title} />
		<FormInput
			name="description"
			class="w-full"
			hideLabel={true}
			errors={formErrors?.errors?.description}
		/>
		<div class="card-actions justify-end w-full">
			<LoadingButton
				text="add"
				class="flex-auto"
				type="submit"
				loading={isCreateTodoCategorySubmitting}
			/>
			<LoadingButton text="reset" class="btn-warning" type="button" on:click={resetForm} />
		</div>
	</div>
</form>
