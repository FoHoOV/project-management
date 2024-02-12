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
	import { editTodoCommentSchema } from './validator';
	import { page } from '$app/stores';
	import type { TodoComment } from '$lib/generated-client/models';
	import { generateTodoListUrl } from '$lib/utils/params/route';
	import EnhancedForm from '$components/forms/EnhancedForm.svelte';
	import { todoComments } from '$lib/stores/todo-comments';

	const { form, comment } = $props<Props>();
</script>

<EnhancedForm
	action="{generateTodoListUrl(
		$page.params.project_name,
		$page.params.project_id
	)}?/editTodoComment"
	enhancerConfig={{
		validator: { schema: editTodoCommentSchema },
		form: form,
		action: 'editTodoComment'
	}}
	onSubmitSucceeded={async (event) => {
		todoComments.update(event.response);
	}}
	successfulMessage="Todo comment edited"
>
	{#snippet inputs({ formErrors })}
		<FormInput wrapperClasses="hidden" type="hidden" name="id" value={comment?.id} errors={''} />
		<FormInput
			wrapperClasses="hidden"
			type="hidden"
			name="todo_id"
			value={comment?.todo_id}
			errors={''}
		/>
		<FormInput
			name="message"
			type="text-area"
			autoFocus={true}
			wrapperClasses="w-full"
			inputClasses="min-h-48"
			value={comment.message}
			errors={formErrors?.errors?.message}
		/>
	{/snippet}

	{#snippet submitActions({ loading })}
		<LoadingButton text="edit" class="btn-success flex-1" type="submit" {loading} />
	{/snippet}
</EnhancedForm>
