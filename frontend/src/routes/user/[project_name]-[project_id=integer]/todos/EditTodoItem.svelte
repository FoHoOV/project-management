<script lang="ts" context="module">
	import EnhancedForm from '$components/forms/EnhancedForm.svelte';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';

	import type { ActionData } from './$types';
	import type { TodoCategories } from '$lib/stores/todos/todos.svelte';
	import { editTodoItemSchema } from './validator';
	import { page } from '$app/stores';
	import { generateTodoListUrl } from '$lib/utils/params/route';
	import type { TodoCategoryPartialTodoItem } from '$lib/generated-client/models';
	import { getTodosStoreFromContext } from '$components/todos/utils';

	export type Props = {
		form: ActionData;
		todo: TodoCategoryPartialTodoItem;
	};
</script>

<script lang="ts">
	const { form, todo } = $props<Props>();
	const todoCategoriesStore = getTodosStoreFromContext();
</script>

<EnhancedForm
	action="{generateTodoListUrl($page.params.project_name, $page.params.project_id)}?/editTodoItem"
	enhancerConfig={{
		validator: { schema: editTodoItemSchema },
		form: form,
		action: 'editTodoItem',
		resetOnSubmit: false,
		invalidateAllAfterSubmit: false
	}}
	onSubmitSucceeded={async (event) => {
		todoCategoriesStore?.updateTodo(event.response);
	}}
	successfulMessage="Todo item edited"
>
	{#snippet inputs({ formErrors })}
		<FormInput wrapperClasses="hidden" type="hidden" name="id" value={todo.id} errors={''} />
		<FormInput
			wrapperClasses="hidden"
			type="hidden"
			name="category_id"
			value={todo.category_id}
			errors={''}
		/>
		<FormInput
			name="title"
			autofocus={true}
			value={todo.title}
			wrapperClasses="w-full"
			errors={formErrors?.errors?.title}
		/>
		<FormInput
			name="description"
			label="description (Optional)"
			value={todo.description}
			wrapperClasses="w-full"
			errors={formErrors?.errors?.description}
		/>
		<FormInput
			name="due_date"
			label="Due date (Optional)"
			wrapperClasses="w-full"
			type="date"
			value={todo.due_date?.toLocaleDateString('en-CA')}
			errors={formErrors?.errors?.due_date}
		/>
	{/snippet}

	{#snippet actions({ loading })}
		<LoadingButton text="edit" class="btn-success flex-1" type="submit" {loading} />
	{/snippet}
</EnhancedForm>
