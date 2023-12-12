<script lang="ts">
	import type { ActionData } from './$types';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import Alert from '$components/Alert.svelte';
	import { getFormErrors, superEnhance } from '$lib/actions/form';
	import { editTagSchema } from './validator';
	import { page } from '$app/stores';
	import type { TodoItemPartialTag } from '$lib/generated-client/models';
	import { generateTodoListUrl } from '$lib/utils/params/route';
	import todos from '$lib/stores/todos';

	export let form: ActionData;
	export let tag: TodoItemPartialTag;

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
	action="{generateTodoListUrl($page.params.project_name, $page.params.project_id)}?/editTag"
	use:superEnhance={{
		validator: { schema: editTagSchema },
		form: form,
		action: 'editTag'
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
		todos.updateTag(e.detail.response);
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
			message={state == 'submit-successful' ? 'tag edited!' : ''}
		/>
		<Alert class="mb-1" type="error" message={formErrors?.message} />
		<FormInput class="hidden" type="hidden" name="id" value={tag.id} errors={''} />
		<FormInput
			name="name"
			type="text"
			autoFocus={true}
			class="w-full"
			value={tag.name}
			hideLabel={true}
			errors={formErrors?.errors?.message}
		/>
		<div class="card-actions mt-1 w-full justify-end">
			<LoadingButton
				text="Edit"
				class="btn-success flex-1"
				type="submit"
				loading={state == 'submitting'}
			/>
			<LoadingButton text="reset" class="btn-warning flex-1" type="button" on:click={resetForm} />
		</div>
	</div>
</form>
