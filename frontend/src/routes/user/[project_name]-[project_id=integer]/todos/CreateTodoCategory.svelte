<script context="module" lang="ts">
	export type Props = {
		form: ActionData;
	};
</script>

<script lang="ts">
	import type { ActionData } from './$types';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import { todoCategories } from '$lib/stores/todos';
	import { createTodoCategorySchema } from './validator';
	import { page } from '$app/stores';
	import { generateTodoListUrl } from '$lib/utils/params/route';
	import EnhancedForm from '$components/forms/EnhancedForm.svelte';

	const { form } = $props<Props>();
</script>

<EnhancedForm
	action="{generateTodoListUrl($page.params.project_name, $page.params.project_id)}?/createCategory"
	enhancerConfig={{
		validator: { schema: createTodoCategorySchema },
		form: form,
		action: 'createCategory'
	}}
	onSubmitSucceeded={async (event) => {
		todoCategories.addCategory(event.response);
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
	{/snippet}

	{#snippet submitActions({ loading })}
		<LoadingButton text="create" class="btn-success flex-1" type="submit" {loading} />
	{/snippet}
</EnhancedForm>
