<script lang="ts">
	import type { ActionData } from './$types';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import Error from '$components/Error.svelte';
	import { getFormErrors, superEnhance } from '$lib/enhance/form';
	import todos from '$lib/stores/todos';
	import { createTodoItemSchema } from './validator';

	export let form: ActionData;
	export let categoryId: number;

	let formElement: HTMLFormElement;

	$: formErrors = getFormErrors(form);
	let isAddTodoItemSubmitting = false;

	function resetForm() {
		formElement.reset();
		formErrors = { errors: undefined, message: undefined };
	}
</script>

<form
	action="/user/todos?/addTodo"
	use:superEnhance={{ validator: { schema: createTodoItemSchema }, form: form }}
	on:submitclienterror={(e) => {
		formErrors = {
			errors: e.detail,
			message: 'Invalid form, please review your inputs'
		};
	}}
	on:submitstarted={() => {
		isAddTodoItemSubmitting = true;
	}}
	on:submitstarted={() => {
		isAddTodoItemSubmitting = false;
	}}
	on:submitsucceeded={(e) => {
		todos.addTodo(e.detail.response);
		resetForm();
	}}
	bind:this={formElement}
	method="post"
	class="flex w-full items-start justify-center card bg-base-300 flex-row"
>
	<div class="card-body items-center text-center">
		<Error message={formErrors?.message} />
		<FormInput className="hidden" type="hidden" name="is_done" value={false} errors={''} />
		<FormInput className="hidden" type="hidden" value={categoryId} name="category_id" errors={''} />
		<FormInput
			name="title"
			className="w-full"
			hideLabel={true}
			errors={formErrors?.errors?.title}
		/>
		<FormInput
			name="description"
			className="w-full"
			hideLabel={true}
			errors={formErrors?.errors?.description}
		/>
		<div class="card-actions justify-end w-full">
			<LoadingButton
				text="add"
				className="flex-auto"
				type="submit"
				loading={isAddTodoItemSubmitting}
			/>
			<LoadingButton text="reset" className="btn-warning" type="button" on:click={resetForm} />
		</div>
	</div>
</form>
