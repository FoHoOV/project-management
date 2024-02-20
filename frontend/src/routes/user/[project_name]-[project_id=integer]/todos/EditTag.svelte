<script lang="ts" context="module">
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import EnhancedForm from '$components/forms/EnhancedForm.svelte';

	import type { ActionData } from './$types';
	import { page } from '$app/stores';
	import type { TodoItemPartialTag } from '$lib/generated-client/models';
	import { generateTodoListUrl } from '$lib/utils/params/route';
	import type { TodoCategories } from '$lib/stores/todos/todos.svelte';
	import { editTagSchema } from '$routes/user/[project_name]-[project_id=integer]/todos/validator';

	export type Props = {
		form: ActionData;
		todoCategoriesStore: TodoCategories;
		tag: TodoItemPartialTag;
	};
</script>

<script lang="ts">
	const { form, todoCategoriesStore, tag } = $props<Props>();
</script>

<EnhancedForm
	action="{generateTodoListUrl($page.params.project_name, $page.params.project_id)}?/editTag"
	enhancerConfig={{
		validator: { schema: editTagSchema },
		form: form,
		action: 'editTag',
		resetOnSubmit: false
	}}
	onSubmitSucceeded={async (event) => {
		todoCategoriesStore?.updateTag(event.response);
	}}
	successfulMessage="Todo tag edited"
>
	{#snippet inputs({ formErrors })}
		<FormInput wrapperClasses="hidden" type="hidden" name="id" value={tag.id} errors={''} />
		<FormInput
			name="name"
			type="text"
			autofocus={true}
			wrapperClasses="w-full"
			value={tag.name}
			errors={formErrors?.errors?.name}
		/>
	{/snippet}

	{#snippet actions({ loading })}
		<LoadingButton text="edit" class="btn-success flex-1" type="submit" {loading} />
	{/snippet}
</EnhancedForm>
