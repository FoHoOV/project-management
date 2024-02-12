<script context="module" lang="ts">
	export type Props = {
		form: ActionData;
		todoId: number;
	};
</script>

<script lang="ts">
	import type { ActionData } from './$types';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import { addTagSchema } from './validator';
	import { page } from '$app/stores';
	import { generateTodoListUrl } from '$lib/utils/params/route';
	import { todoCategories } from '$lib/stores/todos/todos.svelte';
	import EnhancedForm from '$components/forms/EnhancedForm.svelte';

	const { form, todoId } = $props<Props>();
</script>

<EnhancedForm
	url="{generateTodoListUrl($page.params.project_name, $page.params.project_id)}?/addTag"
	enhancerConfig={{
		validator: { schema: addTagSchema },
		form: form,
		action: 'addTag'
	}}
	onSubmitSucceeded={(response) => {
		todoCategories.addTag(todoId, response);
	}}
>
	{#snippet inputs({ formErrors })}
		<FormInput
			name="todo_id"
			wrapperClasses="w-full"
			hideLabel={true}
			value={todoId}
			errors={''}
			type="hidden"
		/>
		<FormInput
			name="project_id"
			label="project id"
			hideLabel={true}
			value={$page.params.project_id}
			type="hidden"
			errors={''}
		/>
		<FormInput
			name="name"
			label="name"
			wrapperClasses="w-full"
			autoFocus={true}
			errors={formErrors.errors?.name}
		/>
	{/snippet}

	{#snippet submitActions({ loading })}
		<LoadingButton text="add" class="btn-success flex-1" type="submit" {loading} />
	{/snippet}
</EnhancedForm>
