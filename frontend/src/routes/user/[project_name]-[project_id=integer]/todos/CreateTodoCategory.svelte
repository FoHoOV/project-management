<script lang="ts" context="module">
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import EnhancedForm from '$components/forms/EnhancedForm.svelte';

	import type { ActionData } from './$types';
	import type { TodoCategories } from '$lib/stores/todos/todos.svelte';
	import { createTodoCategorySchema } from './validator';
	import { page } from '$app/stores';
	import { generateTodoListUrl } from '$lib/utils/params/route';

	export type Props = {
		form: ActionData;
		todoCategoriesStore: TodoCategories;
	};
</script>

<script lang="ts">
	const { form, todoCategoriesStore } = $props<Props>();
</script>

<EnhancedForm
	action="{generateTodoListUrl($page.params.project_name, $page.params.project_id)}?/createCategory"
	enhancerConfig={{
		validator: { schema: createTodoCategorySchema },
		form: form,
		action: 'createCategory'
	}}
	onSubmitSucceeded={async (event) => {
		todoCategoriesStore?.addCategory(event.response);
	}}
	successfulMessage="Todo category created"
>
	{#snippet inputs({ formErrors })}
		<FormInput
			wrapperClasses="hidden"
			type="hidden"
			name="project_id"
			value={$page.params.project_id}
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
	{/snippet}

	{#snippet actions({ loading })}
		<LoadingButton text="create" class="btn-success flex-1" type="submit" {loading} />
	{/snippet}
</EnhancedForm>
