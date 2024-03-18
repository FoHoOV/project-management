<script lang="ts" context="module">
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import EnhancedForm from '$components/forms/EnhancedForm.svelte';

	import type { ActionData } from './$types';
	import { addTagSchema } from './validator';
	import { page } from '$app/stores';
	import { generateTodoListItemsUrl } from '$lib/utils/params/route';
	import { getTodosStoreFromContext } from '$components/todos/utils';

	export type Props = {
		form: ActionData;
		todoId: number;
	};
</script>

<script lang="ts">
	const { form, todoId }: Props = $props();
	const todoCategoriesStore = getTodosStoreFromContext();
</script>

<EnhancedForm
	action="{generateTodoListItemsUrl($page.params.project_name, $page.params.project_id)}?/addTag"
	enhancerConfig={{
		validator: { schema: addTagSchema },
		form: form,
		action: 'addTag',
		invalidateAllAfterSubmit: false
	}}
	onSubmitSucceeded={(event) => {
		todoCategoriesStore?.addTag(todoId, event.response);
	}}
	successfulMessage="Tag created"
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
			autofocus={true}
			errors={formErrors?.errors?.name}
		/>
	{/snippet}

	{#snippet actions({ loading })}
		<LoadingButton text="add" class="btn-success flex-1" type="submit" {loading} />
	{/snippet}
</EnhancedForm>
