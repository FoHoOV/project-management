<script lang="ts" context="module">
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import EnhancedForm from '$components/forms/EnhancedForm.svelte';

	import type { ActionData } from './$types';
	import { createTodoItemSchema } from './validator';
	import { page } from '$app/stores';
	import { generateTodoListItemsUrl } from '$lib/utils/params/route';
	import { getTodosStoreFromContext } from '$components/todos/utils';

	export type Props = {
		form: ActionData;
		categoryId: number;
	};
</script>

<script lang="ts">
	const { form, categoryId }: Props = $props();
	const todoCategoriesStore = getTodosStoreFromContext();
</script>

<EnhancedForm
	action="{generateTodoListItemsUrl($page.params.project_name, $page.params.project_id)}?/addTodo"
	enhancerConfig={{
		validator: { schema: createTodoItemSchema },
		form: form,
		action: 'addTodo',
		invalidateAllAfterSubmit: false
	}}
	onSubmitSucceeded={async (event) => {
		todoCategoriesStore?.addTodo(event.response);
	}}
	successfulMessage="Todo item created"
>
	{#snippet inputs({ formErrors })}
		<FormInput wrapperClasses="hidden" type="hidden" name="is_done" value={false} errors={''} />
		<FormInput
			wrapperClasses="hidden"
			type="hidden"
			value={categoryId}
			name="category_id"
			errors={''}
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
