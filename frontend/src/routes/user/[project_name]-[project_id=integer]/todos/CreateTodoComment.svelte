<script context="module" lang="ts">
	export type Props = {
		form: ActionData;
		todoId: number;
	};
</script>

<script lang="ts">
	import type { ActionData } from './$types';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import Alert from '$components/Alert.svelte';
	import { getFormErrors, superEnhance } from '$lib/actions/form';
	import { createTodoCommentSchema } from './validator';
	import { page } from '$app/stores';
	import todoComments from '$lib/stores/todo-comments';
	import { generateTodoListUrl } from '$lib/utils/params/route';
	import { untrack } from 'svelte';

	const { form, todoId } = $props<Props>();

	let formElement = $state<HTMLFormElement | null>(null);

	let componentState = $state<'submitting' | 'submit-successful' | 'none'>('none');

	let formErrors = $state(getFormErrors(form));

	$effect(() => {
		form;
		untrack(() => {
			formErrors = getFormErrors(form);
		});
	});

	function resetForm() {
		formElement?.reset();
		formErrors = { errors: undefined, message: undefined };
		componentState = 'none';
	}
</script>

<form
	action="{generateTodoListUrl(
		$page.params.project_name,
		$page.params.project_id
	)}?/createTodoComment"
	use:superEnhance={{
		validator: { schema: createTodoCommentSchema },
		form: form,
		action: 'createTodoComment'
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
		todoComments.addComment(e.detail.response);
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
			message={componentState == 'submit-successful' ? 'comment created!' : ''}
		/>
		<Alert class="mb-1" type="error" message={formErrors?.message} />
		<FormInput class="hidden" type="hidden" name="todo_id" value={todoId} errors={''} />
		<FormInput
			name="message"
			type="text-area"
			autoFocus={true}
			class="w-full"
			inputClasses="min-h-16"
			errors={formErrors?.errors?.message}
		/>
		<div class="card-actions mt-1 w-full justify-end">
			<LoadingButton text="reset" class="btn-warning flex-1" type="button" on:click={resetForm} />
			<LoadingButton
				text="add"
				class="btn-success flex-1"
				type="submit"
				loading={componentState == 'submitting'}
			/>
		</div>
	</div>
</form>
