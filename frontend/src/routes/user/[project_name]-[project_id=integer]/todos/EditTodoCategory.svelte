<script lang="ts" context="module">
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import EnhancedForm from '$components/forms/EnhancedForm.svelte';

	import type { ActionData } from './$types';
	import { editTodoCategorySchema } from './validator';
	import { page } from '$app/stores';
	import { generateTodoListItemsUrl } from '$lib/utils/params/route';
	import type { TodoCategory } from '$lib/generated-client/models';
	import { getTodoCategories } from '$lib/stores';

	export type Props = {
		form: ActionData;
		category: TodoCategory;
	};
</script>

<script lang="ts">
	const { form, category }: Props = $props();
	const todoCategoriesStore = getTodoCategories();
</script>

<EnhancedForm
	action="{generateTodoListItemsUrl(
		$page.params.project_name,
		$page.params.project_id
	)}?/editTodoCategory"
	enhancerConfig={{
		validator: { schema: editTodoCategorySchema },
		form: form,
		actionName: 'editTodoCategory',
		resetOnSubmit: false,
		invalidateAllAfterSubmit: false
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
