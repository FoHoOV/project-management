<script context="module" lang="ts">
	export type Props = {
		form: ActionData;
		categoryId: number;
	};
</script>

<script lang="ts">
	import type { ActionData } from './$types';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import { todoCategories } from '$lib/stores/todos';
	import { createTodoItemSchema } from './validator';
	import { page } from '$app/stores';
	import { generateTodoListUrl } from '$lib/utils/params/route';
	import EnhancedForm from '$components/forms/EnhancedForm.svelte';

	const { form, categoryId } = $props<Props>();
</script>

<EnhancedForm
	action="{generateTodoListUrl($page.params.project_name, $page.params.project_id)}?/addTodo"
	enhancerConfig={{
		validator: { schema: createTodoItemSchema },
		form: form,
		action: 'addTodo'
	}}
	onSubmitSucceeded={async (event) => {
		todoCategories.addTodo(event.response);
	}}
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
			autoFocus={true}
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

	{#snippet submitActions({ loading })}
		<LoadingButton text="create" class="btn-success flex-1" type="submit" {loading} />
	{/snippet}
</EnhancedForm>
