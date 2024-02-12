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
	import { createTodoCommentSchema } from './validator';
	import { page } from '$app/stores';
	import { todoComments } from '$lib/stores/todo-comments';
	import { generateTodoListUrl } from '$lib/utils/params/route';
	import EnhancedForm from '$components/forms/EnhancedForm.svelte';

	const { form, todoId } = $props<Props>();
</script>

<EnhancedForm
	action="{generateTodoListUrl(
		$page.params.project_name,
		$page.params.project_id
	)}?/createTodoComment"
	enhancerConfig={{
		validator: { schema: createTodoCommentSchema },
		form: form,
		action: 'createTodoComment'
	}}
	onSubmitSucceeded={async (event) => {
		todoComments.add(event.response);
	}}
>
	{#snippet inputs({ formErrors })}
		<FormInput wrapperClasses="hidden" type="hidden" name="todo_id" value={todoId} errors={''} />
		<FormInput
			name="message"
			type="text-area"
			autoFocus={true}
			wrapperClasses="w-full"
			inputClasses="min-h-48"
			errors={formErrors?.errors?.message}
		/>
	{/snippet}

	{#snippet submitActions({ loading })}
		<LoadingButton text="add" class="btn-success flex-1" type="submit" {loading} />
	{/snippet}
</EnhancedForm>
