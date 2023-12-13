<script lang="ts">
	import type { ActionData } from './$types';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import Alert from '$components/Alert.svelte';
	import { getFormErrors, superEnhance } from '$lib/actions/form';
	import { addTodoItemDependencySchema } from './validator';
	import { page } from '$app/stores';
	import { generateTodoListUrl } from '$lib/utils/params/route';
	import todos from '$lib/stores/todos/todos';
	import type { TodoItem } from '$lib/generated-client/models';

	export let form: ActionData;
	export let todo: TodoItem;

	let formElement: HTMLFormElement;
	let state: 'submitting' | 'submit-successful' | 'none' = 'none';

	$: formErrors = getFormErrors(form);

	function resetForm() {
		formElement.reset();
		formErrors = { errors: undefined, message: undefined };
		state = 'none';
	}
</script>

<form
	action="{generateTodoListUrl(
		$page.params.project_name,
		$page.params.project_id
	)}?/addTodoItemDependency"
	use:superEnhance={{
		validator: { schema: addTodoItemDependencySchema },
		form: form,
		action: 'addTodoItemDependency'
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
	on:submitsucceeded={async (e) => {
		todos.addDependency(todo.id, e.detail.response);
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
			message={state == 'submit-successful'
				? 'Dependency added! Note that current todo status changed to `UNDONE`'
				: ''}
		/>
		<Alert class="mb-1" type="error" message={formErrors?.message} />
		<FormInput
			name="todo_id"
			class="w-full"
			hideLabel={true}
			value={todo.id}
			errors={''}
			type="hidden"
		/>
		<FormInput
			name="dependant_todo_id"
			label="depends on (todo id)"
			class="w-full"
			autoFocus={true}
			hideLabel={true}
			errors={formErrors.errors?.dependant_todo_id?.toString()}
		/>
		<div class="card-actions mt-1 w-full justify-end">
			<LoadingButton
				text="add"
				class="btn-success flex-1"
				type="submit"
				loading={state == 'submitting'}
			/>
			<LoadingButton text="reset" class="btn-warning flex-1" type="button" on:click={resetForm} />
		</div>
	</div>
</form>
