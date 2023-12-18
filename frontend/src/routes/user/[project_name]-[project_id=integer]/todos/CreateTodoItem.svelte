<script lang="ts">
	import type { ActionData } from './$types';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import Alert from '$components/Alert.svelte';
	import { getFormErrors, superEnhance } from '$lib/actions/form';
	import todos from '$lib/stores/todos';
	import { createTodoItemSchema } from './validator';
	import { page } from '$app/stores';
	import { generateTodoListUrl } from '$lib/utils/params/route';

	export let form: ActionData;
	export let categoryId: number;

	let state: 'submitting' | 'submit-successful' | 'none' = 'none';
	let showDatePicker: boolean = false;
	let formElement: HTMLFormElement;

	$: formErrors = getFormErrors(form);

	function resetForm() {
		formElement.reset();
		formErrors = { errors: undefined, message: undefined };
		state = 'none';
	}
</script>

<form
	action="{generateTodoListUrl($page.params.project_name, $page.params.project_id)}?/addTodo"
	use:superEnhance={{
		validator: { schema: createTodoItemSchema },
		form: form,
		action: 'addTodo'
	}}
	on:submitclienterror={(e) => {
		formErrors = {
			errors: e.detail,
			message: 'Invalid form, please review your inputs'
		};
		state = 'none';
	}}
	on:submitstarted={() => {
		state = 'submitting';
	}}
	on:submitended={() => {
		state = 'none';
	}}
	on:submitsucceeded={(e) => {
		todos.addTodo(e.detail.response);
		resetForm();
		state = 'submit-successful';
	}}
	bind:this={formElement}
	method="post"
	class="card flex w-full flex-row items-start justify-center bg-base-300"
>
	<div class="card-body items-center text-center">
		<Alert
			class="mb-1"
			type="success"
			message={state == 'submit-successful' ? 'todo created!' : ''}
		/>
		<Alert class="mb-1" type="error" message={formErrors?.message} />
		<FormInput class="hidden" type="hidden" name="is_done" value={false} errors={''} />
		<FormInput class="hidden" type="hidden" value={categoryId} name="category_id" errors={''} />
		<FormInput name="title" autoFocus={true} class="w-full" errors={formErrors?.errors?.title} />
		<FormInput
			name="description"
			label="description (Optional)"
			class="w-full"
			errors={formErrors?.errors?.description}
		/>
		<FormInput
			name="due_date"
			label="Due date (Optional)"
			class="w-full"
			type="date"
			errors={formErrors?.errors?.due_date}
		/>
		<div class="card-actions mt-1 w-full justify-end">
			<LoadingButton text="reset" class="btn-warning  flex-1" type="button" on:click={resetForm} />
			<LoadingButton
				text="create"
				class="btn-success flex-1"
				type="submit"
				loading={state == 'submitting'}
			/>
		</div>
	</div>
</form>
