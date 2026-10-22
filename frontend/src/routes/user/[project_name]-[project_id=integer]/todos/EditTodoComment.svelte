<script lang="ts" module>
	import EnhancedForm from '#lib/components/forms/EnhancedForm.svelte';
	import FormInput from '#lib/components/forms/FormInput.svelte';
	import LoadingButton from '#lib/components/buttons/LoadingButton.svelte';

	import type { ActionData } from './$types';
	import { editTodoCommentSchema } from './validator';
	import type { TodoComment } from '#lib/generated-client/index.js';
	import { generateTodoListItemsUrl, type ProjectRouteParams } from '#lib/utils/params/route.js';
	import { TodoComments } from '#lib/stores/todo-comments/index.js';

	export type Props = {
		params: ProjectRouteParams;
		form: ActionData;
		todoCommentsStore: TodoComments;
		comment: TodoComment;
	};
</script>

<script lang="ts">
	const { params, form, todoCommentsStore, comment }: Props = $props();
</script>

<EnhancedForm
	action="{generateTodoListItemsUrl(params.project_name, params.project_id)}?/editTodoComment"
	enhancerConfig={{
		validator: { schema: editTodoCommentSchema },
		form: form,
		actionName: 'editTodoComment',
		resetOnSubmit: false,
		refreshAllAfterSubmit: false
	}}
	onSubmitSucceeded={async (event) => {
		todoCommentsStore.update(event.response);
	}}
	successfulMessage="Todo comment edited"
>
	{#snippet inputs({ formErrors })}
		<FormInput wrapperClasses="hidden" type="hidden" name="id" value={comment?.id} errors="" />
		<FormInput
			wrapperClasses="hidden"
			type="hidden"
			name="todo_id"
			value={comment?.todo_id}
			errors=""
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
