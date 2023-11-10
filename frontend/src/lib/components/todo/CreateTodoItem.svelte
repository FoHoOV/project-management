<script lang="ts">
	import type { ActionData } from '../../../routes/user/todos/$types';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import Error from '$components/Error.svelte';
	import { getFormErrors, superEnhance } from '$lib/enhance/form';
	import todos from '$lib/stores/todos';
	import { createTodoItemSchema } from '$routes/user/todos/validator';

	export let form: ActionData;
	export let categoryId: number;

	let formElement: HTMLFormElement;
	let firstInputElement: FormInput;

	$: formErrors = getFormErrors(form);
	let isAddTodoItemSubmitting = false;

	function resetForm() {
		formElement.reset();
		formErrors = { errors: undefined, message: undefined };
		firstInputElement.focus();
	}
</script>

<form
	action="/user/todos?/addTodo"
	use:superEnhance={{
		validator: { schema: createTodoItemSchema },
		action: form?.addTodoResult
	}}
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
	class="card flex w-full flex-row items-start justify-center bg-base-300"
>
	<div class="card-body items-center text-center">
		<Error message={formErrors?.message} />
		<FormInput class="hidden" type="hidden" name="is_done" value={false} errors={''} />
		<FormInput class="hidden" type="hidden" value={categoryId} name="category_id" errors={''} />
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
			<LoadingButton text="add" class="flex-auto" type="submit" loading={isAddTodoItemSubmitting} />
			<LoadingButton text="reset" class="btn-warning" type="button" on:click={resetForm} />
		</div>
	</div>
</form>
