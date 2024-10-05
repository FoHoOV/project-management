<script lang="ts" module>
	import EnhancedForm from '$components/forms/EnhancedForm.svelte';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';

	import type { ActionData } from './$types';
	import { editTodoCommentSchema } from './validator';
	import { page } from '$app/stores';
	import type { TodoComment } from '$lib/generated-client/models';
	import { generateTodoListItemsUrl } from '$lib/utils/params/route';
	import { TodoComments } from '$lib/stores/todo-comments';

	export type Props = {
		form: ActionData;
		todoCommentsStore: TodoComments;
		comment: TodoComment;
	};
</script>

<script lang="ts">
	const { form, todoCommentsStore, comment }: Props = $props();
</script>

<EnhancedForm
	action="{generateTodoListItemsUrl(
		$page.params.project_name,
		$page.params.project_id
	)}?/editTodoComment"
	enhancerConfig={{
		validator: { schema: editTodoCommentSchema },
		form: form,
		actionName: 'editTodoComment',
		resetOnSubmit: false,
		invalidateAllAfterSubmit: false
	}}
	onSubmitSucceeded={async (event) => {
		todoCommentsStore.update(event.response);
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
			autofocus={true}
			wrapperClasses="w-full"
			inputClasses="min-h-48"
			value={comment.message}
			errors={formErrors?.errors?.message}
		/>
	{/snippet}

	{#snippet actions({ loading })}
		<LoadingButton text="edit" class="btn-success flex-1" type="submit" {loading} />
	{/snippet}
</EnhancedForm>
