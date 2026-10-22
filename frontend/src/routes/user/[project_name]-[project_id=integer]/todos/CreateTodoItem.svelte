<script lang="ts" module>
	import FormInput from '#lib/components/forms/FormInput.svelte';
	import LoadingButton from '#lib/components/buttons/LoadingButton.svelte';
	import EnhancedForm from '#lib/components/forms/EnhancedForm.svelte';
	import type { EnhanceOptions } from '#lib/actions/form/index.js';

	import type { ActionData } from './$types';
	import { createTodoItemSchema } from './validator';
	import { generateTodoListItemsUrl, type ProjectRouteParams } from '#lib/utils/params/route.js';
	import { getTodoCategories } from '#lib/stores/index.js';

	export type Props = {
		params: ProjectRouteParams;
		categoryId: number;
	};
</script>

<script lang="ts">
	const { params, categoryId }: Props = $props();
	const todoCategoriesStore = getTodoCategories();

	const enhancerConfig: EnhanceOptions<typeof createTodoItemSchema, ActionData, 'addTodo'> = {
		validator: { schema: createTodoItemSchema },
		actionName: 'addTodo',
		refreshAllAfterSubmit: false
	};
</script>

<EnhancedForm
	action="{generateTodoListItemsUrl(params.project_name, params.project_id)}?/addTodo"
	{enhancerConfig}
	onSubmitSucceeded={async (event) => {
		todoCategoriesStore?.addTodo(event.response);
	}}
	successfulMessage="Todo item created"
>
	{#snippet inputs({ formErrors })}
		<FormInput wrapperClasses="hidden" type="hidden" name="is_done" value={false} errors="" />
		<FormInput
			wrapperClasses="hidden"
			type="hidden"
			value={categoryId}
			name="category_id"
			errors=""
		/>
		<FormInput
			name="title"
			autofocus={true}
			wrapperClasses="w-full"
			errors={formErrors?.errors?.title}
		/>
		<FormInput
			name="description"
			label="description (Optional)"
			wrapperClasses="w-full"
			errors={formErrors?.errors?.description}
		/>
		<FormInput
			name="due_date"
			label="Due date (Optional)"
			wrapperClasses="w-full"
			type="date"
			errors={formErrors?.errors?.due_date}
		/>
	{/snippet}

	{#snippet actions({ loading })}
		<LoadingButton text="create" class="btn-success flex-1" type="submit" {loading} />
	{/snippet}
</EnhancedForm>
