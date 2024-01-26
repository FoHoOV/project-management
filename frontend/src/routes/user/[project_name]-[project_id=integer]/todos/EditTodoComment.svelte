<script context="module" lang="ts">
	export type Props = {
		form: ActionData;
		comment: TodoComment;
	};
</script>

<script lang="ts">
	import type { ActionData } from './$types';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import Alert from '$components/Alert.svelte';
	import { getFormErrors, superEnhance } from '$lib/actions/form';
	import { editTodoCommentSchema } from './validator';
	import { page } from '$app/stores';
	import type { TodoComment } from '$lib/generated-client/models';
	import todoComments from '$lib/stores/todo-comments/todo-comments';
	import { generateTodoListUrl } from '$lib/utils/params/route';

	const { form, comment } = $props<Props>();

	let formElement = $state<HTMLFormElement | null>(null);

	let componentState = $state<'submitting' | 'submit-successful' | 'none'>('none');

	let formErrors = $state(getFormErrors(form));

	$effect(() => {
		formErrors = getFormErrors(form);
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
	)}?/editTodoComment"
	use:superEnhance={{
		validator: { schema: editTodoCommentSchema },
		form: form,
		action: 'editTodoComment'
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
		todoComments.updateComment(e.detail.response);
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
			message={componentState == 'submit-successful' ? 'comment edited!' : ''}
		/>
		<Alert class="mb-1" type="error" message={formErrors?.message} />
		<FormInput class="hidden" type="hidden" name="id" value={comment?.id} errors={''} />
		<FormInput class="hidden" type="hidden" name="todo_id" value={comment?.todo_id} errors={''} />
		<FormInput
			name="message"
			type="text-area"
			autoFocus={true}
			class="w-full"
			inputClasses="min-h-16"
			value={comment.message}
			errors={formErrors?.errors?.message}
		/>
		<div class="card-actions mt-1 w-full justify-end">
			<LoadingButton text="reset" class="btn-warning flex-1" type="button" on:click={resetForm} />
			<LoadingButton
				text="edit"
				class="btn-success flex-1"
				type="submit"
				loading={componentState == 'submitting'}
			/>
		</div>
	</div>
</form>
