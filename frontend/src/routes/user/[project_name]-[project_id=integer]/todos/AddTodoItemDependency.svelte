<script lang="ts" context="module">
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import EnhancedForm from '$components/forms/EnhancedForm.svelte';

	import type { ActionData } from './$types';
	import { addTodoItemDependencySchema } from './validator';
	import { page } from '$app/stores';
	import { generateTodoListUrl } from '$lib/utils/params/route';
	import type { TodoCategories } from '$lib/stores/todos/todos.svelte';
	import type { TodoCategoryPartialTodoItem } from '$lib/generated-client/models';

	export type Props = {
		form: ActionData;
		todoCategoriesStore: TodoCategories;
		todo: TodoCategoryPartialTodoItem;
	};
</script>

<script lang="ts">
	const { form, todoCategoriesStore, todo } = $props<Props>();
</script>

<EnhancedForm
	action="{generateTodoListUrl(
		$page.params.project_name,
		$page.params.project_id
	)}?/addTodoItemDependency"
	enhancerConfig={{
		validator: { schema: addTodoItemDependencySchema },
		form: form,
		action: 'addTodoItemDependency',
		invalidateAllAfterSubmit: false
	}}
	onSubmitSucceeded={(event) => {
		todoCategoriesStore?.addDependency(todo.id, event.response);
	}}
	successfulMessage="Todo dependency added"
>
	{#snippet inputs({ formErrors })}
		<FormInput
			name="todo_id"
			wrapperClasses="w-full"
			hideLabel={true}
			value={todo.id}
			errors={''}
			type="hidden"
		/>
		<FormInput
			name="dependant_todo_id"
			label="depends on (todo id)"
			wrapperClasses="w-full"
			autofocus={true}
			errors={formErrors.errors?.dependant_todo_id?.toString()}
		/>
	{/snippet}

	{#snippet actions({ loading })}
		<LoadingButton text="add" class="btn-success flex-1" type="submit" {loading} />
	{/snippet}
</EnhancedForm>
