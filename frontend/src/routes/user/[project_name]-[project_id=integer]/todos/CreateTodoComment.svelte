<script lang="ts" context="module">
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import EnhancedForm from '$components/forms/EnhancedForm.svelte';

	import type { ActionData } from './$types';
	import { createTodoCommentSchema } from './validator';
	import { page } from '$app/stores';
	import { TodoComments } from '$lib/stores/todo-comments';
	import { generateTodoListItemsUrl } from '$lib/utils/params/route';

	export type Props = {
		form: ActionData;
		todoCommentsStore: TodoComments;
		todoId: number;
	};
</script>

<script lang="ts">
	const { form, todoCommentsStore, todoId }: Props = $props();
</script>

<EnhancedForm
	action="{generateTodoListItemsUrl(
		$page.params.project_name,
		$page.params.project_id
	)}?/createTodoComment"
	enhancerConfig={{
		validator: { schema: createTodoCommentSchema },
		form: form,
		action: 'createTodoComment',
		invalidateAllAfterSubmit: false
	}}
	onSubmitSucceeded={async (event) => {
		todoCommentsStore.add(event.response);
	}}
	successfulMessage="Todo comment created"
>
	{#snippet inputs({ formErrors })}
		<FormInput wrapperClasses="hidden" type="hidden" name="todo_id" value={todoId} errors={''} />
		<FormInput
			name="message"
			type="text-area"
			autofocus={true}
			wrapperClasses="w-full"
			inputClasses="min-h-48"
			errors={formErrors?.errors?.message}
		/>
	{/snippet}

	{#snippet actions({ loading })}
		<LoadingButton text="add" class="btn-success flex-1" type="submit" {loading} />
	{/snippet}
</EnhancedForm>
