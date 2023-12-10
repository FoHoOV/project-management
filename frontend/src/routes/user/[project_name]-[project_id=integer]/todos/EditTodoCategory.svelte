<script lang="ts">
	import type { ActionData } from './$types';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import Alert from '$components/Alert.svelte';
	import { getFormErrors, superEnhance } from '$lib/actions/form';
	import todos from '$lib/stores/todos';
	import { editTodoCategorySchema } from './validator';
	import { page } from '$app/stores';
	import { generateTodoListUrl } from '$lib/utils/params/route';
	import type { TodoCategory } from '$lib/generated-client/models';

	export let form: ActionData;
	export let category: TodoCategory;

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
	)}?/editTodoCategory"
	use:superEnhance={{
		validator: { schema: editTodoCategorySchema },
		form: form,
		action: 'editTodoCategory'
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
		todos.updateCategory(e.detail.response);
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
			message={state == 'submit-successful' ? 'todo category info updated!' : ''}
		/>
		<Alert class="mb-1" type="error" message={formErrors?.message} />
		<FormInput class="hidden" type="hidden" name="id" value={category.id} errors={''} />
		<FormInput
			name="title"
			autoFocus={true}
			class="w-full"
			value={category.title}
			hideLabel={true}
			errors={formErrors?.errors?.title}
		/>
		<FormInput
			name="description"
			class="w-full"
			value={category.description}
			hideLabel={true}
			errors={formErrors?.errors?.description}
		/>
		<div class="card-actions mt-1 w-full justify-end">
			<LoadingButton
				text="Edit"
				class="btn-success flex-1"
				type="submit"
				loading={state === 'submitting'}
			/>
			<LoadingButton text="reset" class="btn-warning flex-1" type="button" on:click={resetForm} />
		</div>
	</div>
</form>
