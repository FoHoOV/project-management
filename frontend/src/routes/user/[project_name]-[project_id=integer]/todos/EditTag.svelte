<script context="module" lang="ts">
	export type Props = {
		form: ActionData;
		tag: TodoItemPartialTag;
	};
</script>

<script lang="ts">
	import type { ActionData } from './$types';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import { page } from '$app/stores';
	import type { TodoItemPartialTag } from '$lib/generated-client/models';
	import { generateTodoListUrl } from '$lib/utils/params/route';
	import { todoCategories } from '$lib/stores/todos';
	import EnhancedForm from '$components/forms/EnhancedForm.svelte';
	import { editTagSchema } from '$routes/user/[project_name]-[project_id=integer]/todos/validator';

	const { form, tag } = $props<Props>();
</script>

<EnhancedForm
	url="{generateTodoListUrl($page.params.project_name, $page.params.project_id)}?/editTag"
	enhancerConfig={{
		validator: { schema: editTagSchema },
		form: form,
		action: 'editTag'
	}}
	onSubmitSucceeded={async (response) => {
		todoCategories.updateTag(response);
	}}
>
	{#snippet inputs({ formErrors })}
		<FormInput wrapperClasses="hidden" type="hidden" name="id" value={tag.id} errors={''} />
		<FormInput
			name="name"
			type="text"
			autoFocus={true}
			wrapperClasses="w-full"
			value={tag.name}
			errors={formErrors?.errors?.message}
		/>
	{/snippet}

	{#snippet submitActions({ loading })}
		<LoadingButton text="edit" class="btn-success flex-1" type="submit" {loading} />
	{/snippet}
</EnhancedForm>
