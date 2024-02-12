<script context="module" lang="ts">
	export type Props = {
		form: ActionData;
		category: TodoCategory;
	};
</script>

<script lang="ts">
	import type { ActionData } from './$types';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import { todoCategories } from '$lib/stores/todos';
	import { editTodoCategorySchema } from './validator';
	import { page } from '$app/stores';
	import { generateTodoListUrl } from '$lib/utils/params/route';
	import type { TodoCategory } from '$lib/generated-client/models';
	import EnhancedForm from '$components/forms/EnhancedForm.svelte';

	const { form, category } = $props<Props>();
</script>

<EnhancedForm
	action="{generateTodoListUrl(
		$page.params.project_name,
		$page.params.project_id
	)}?/editTodoCategory"
	enhancerConfig={{
		validator: { schema: editTodoCategorySchema },
		form: form,
		action: 'editTodoCategory'
	}}
	onSubmitSucceeded={async (event) => {
		todoCategories.updateCategory(event.response);
	}}
>
	{#snippet inputs({ formErrors })}
		<FormInput wrapperClasses="hidden" type="hidden" name="id" value={category.id} errors={''} />
		<FormInput
			name="title"
			autoFocus={true}
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

	{#snippet submitActions({ loading })}
		<LoadingButton text="edit" class="btn-success flex-1" type="submit" {loading} />
	{/snippet}
</EnhancedForm>
