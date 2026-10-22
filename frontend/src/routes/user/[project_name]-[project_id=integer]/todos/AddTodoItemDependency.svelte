<script lang="ts" module>
	import FormInput from '#lib/components/forms/FormInput.svelte';
	import LoadingButton from '#lib/components/buttons/LoadingButton.svelte';
	import EnhancedForm from '#lib/components/forms/EnhancedForm.svelte';
	import type { EnhanceOptions } from '#lib/actions/form/index.js';

	import type { ActionData } from './$types';
	import { addTodoItemDependencySchema } from './validator';
	import { generateTodoListItemsUrl, type ProjectRouteParams } from '#lib/utils/params/route.js';
	import type { TodoCategoryPartialTodoItem } from '#lib/generated-client/index.js';
	import { getTodoCategories } from '#lib/stores/index.js';

	export type Props = {
		params: ProjectRouteParams;
		todo: TodoCategoryPartialTodoItem;
	};
</script>

<script lang="ts">
	const { params, todo }: Props = $props();
	const todoCategoriesStore = getTodoCategories();

	const enhancerConfig: EnhanceOptions<
		typeof addTodoItemDependencySchema,
		ActionData,
		'addTodoItemDependency'
	> = {
		validator: { schema: addTodoItemDependencySchema },
		actionName: 'addTodoItemDependency',
		refreshAllAfterSubmit: false
	};
</script>

<EnhancedForm
	action="{generateTodoListItemsUrl(params.project_name, params.project_id)}?/addTodoItemDependency"
	{enhancerConfig}
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
			errors=""
			type="hidden"
		/>
		<FormInput
			name="dependant_todo_id"
			label="depends on (todo id)"
			wrapperClasses="w-full"
			autofocus={true}
			errors={formErrors?.errors?.dependant_todo_id?.toString()}
		/>
	{/snippet}

	{#snippet actions({ loading })}
		<LoadingButton text="add" class="btn-success flex-1" type="submit" {loading} />
	{/snippet}
</EnhancedForm>
