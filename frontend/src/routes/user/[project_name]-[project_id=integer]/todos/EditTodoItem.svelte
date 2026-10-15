<script lang="ts" module>
	import EnhancedForm from '#lib/components/forms/EnhancedForm.svelte';
	import FormInput from '#lib/components/forms/FormInput.svelte';
	import LoadingButton from '#lib/components/buttons/LoadingButton.svelte';

	import type { ActionData } from './$types';
	import { editTodoItemSchema } from './validator';
	import { generateTodoListItemsUrl, type ProjectRouteParams } from '#lib/utils/params/route.js';
	import type { TodoCategoryPartialTodoItem } from '#lib/generated-client/index.js';
	import { getTodoCategories } from '#lib/stores/index.js';

	export type Props = {
		params: ProjectRouteParams;
		form: ActionData;
		todo: TodoCategoryPartialTodoItem;
	};
</script>

<script lang="ts">
	const { params, form, todo }: Props = $props();
	const todoCategoriesStore = getTodoCategories();
</script>

<EnhancedForm
	action="{generateTodoListItemsUrl(params)}?/editTodoItem"
	enhancerConfig={{
		validator: { schema: editTodoItemSchema },
		form: form,
		actionName: 'editTodoItem',
		resetOnSubmit: false,
		invalidateAllAfterSubmit: false
	}}
	onSubmitSucceeded={async (event) => {
		todoCategoriesStore?.updateTodo(event.response);
	}}
	successfulMessage="Todo item edited"
>
	{#snippet inputs({ formErrors })}
		<FormInput wrapperClasses="hidden" type="hidden" name="id" value={todo.id} errors="" />
		<FormInput
			wrapperClasses="hidden"
			type="hidden"
			name="category_id"
			value={todo.category_id}
			errors=""
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
			value={todo.due_date}
			errors={formErrors?.errors?.due_date}
		/>
	{/snippet}

	{#snippet actions({ loading })}
		<LoadingButton text="edit" class="btn-success flex-1" type="submit" {loading} />
	{/snippet}
</EnhancedForm>
