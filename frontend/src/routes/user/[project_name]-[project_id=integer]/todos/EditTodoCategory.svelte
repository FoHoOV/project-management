<script lang="ts" context="module">
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import EnhancedForm from '$components/forms/EnhancedForm.svelte';

	import type { ActionData } from './$types';
	import type { TodoCategories } from '$lib/stores/todos/todos.svelte';
	import { editTodoCategorySchema } from './validator';
	import { page } from '$app/stores';
	import { generateTodoListUrl } from '$lib/utils/params/route';
	import type { TodoCategory } from '$lib/generated-client/models';

	export type Props = {
		form: ActionData;
		todoCategoriesStore: TodoCategories;
		category: TodoCategory;
	};
</script>

<script lang="ts">
	const { form, todoCategoriesStore, category } = $props<Props>();
</script>

<EnhancedForm
	action="{generateTodoListUrl(
		$page.params.project_name,
		$page.params.project_id
	)}?/editTodoCategory"
	enhancerConfig={{
		validator: { schema: editTodoCategorySchema },
		form: form,
		action: 'editTodoCategory',
		resetOnSubmit: false
	}}
	onSubmitSucceeded={async (event) => {
		todoCategoriesStore?.updateCategory(event.response);
	}}
	successfulMessage="Todo category edited"
>
	{#snippet inputs({ formErrors })}
		<FormInput wrapperClasses="hidden" type="hidden" name="id" value={category.id} errors={''} />
		<FormInput
			name="title"
			autofocus={true}
			wrapperClasses="w-full"
			value={category.title}
			errors={formErrors?.errors?.title}
		/>
		<FormInput
			name="description"
			label="description (Optional)"
			wrapperClasses="w-full"
			value={category.description}
			errors={formErrors?.errors?.description}
		/>
	{/snippet}

	{#snippet actions({ loading })}
		<LoadingButton text="edit" class="btn-success flex-1" type="submit" {loading} />
	{/snippet}
</EnhancedForm>
