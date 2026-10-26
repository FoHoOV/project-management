<script lang="ts" module>
	import FormInput from '#lib/components/forms/FormInput.svelte';
	import LoadingButton from '#lib/components/buttons/LoadingButton.svelte';
	import EnhancedForm from '#lib/components/forms/EnhancedForm.svelte';
	import type { EnhanceOptions } from '#lib/actions/form/index.js';

	import type { ActionData } from './$types';
	import { createTodoCommentSchema } from './validator';
	import { TodoComments } from '#lib/stores/todo-comments/index.js';
	import { generateTodoListItemsUrl, type ProjectRouteParams } from '#lib/utils/params/route.js';

	export type Props = {
		params: ProjectRouteParams;
		todoCommentsStore: TodoComments;
		todoId: number;
	};
</script>

<script lang="ts">
	const { params, todoCommentsStore, todoId }: Props = $props();

	const enhancerConfig: EnhanceOptions<
		typeof createTodoCommentSchema,
		ActionData,
		'createTodoComment'
	> = {
		validator: { schema: createTodoCommentSchema },
		actionName: 'createTodoComment',
		refreshAllAfterSubmit: false
	};
</script>

<EnhancedForm
	action="{generateTodoListItemsUrl(params.project_name, params.project_id)}?/createTodoComment"
	{enhancerConfig}
	onSubmitSucceeded={async (event) => {
		todoCommentsStore.add(event.response);
	}}
	successfulMessage="Todo comment created"
>
	{#snippet inputs({ formErrors })}
		<FormInput wrapperClasses="hidden" type="hidden" name="todo_id" value={todoId} errors="" />
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
