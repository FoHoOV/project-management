<script lang="ts" module>
	import FormInput from '#lib/components/forms/FormInput.svelte';
	import LoadingButton from '#lib/components/buttons/LoadingButton.svelte';
	import EnhancedForm from '#lib/components/forms/EnhancedForm.svelte';

	import type { ActionData } from './$types';
	import { createTodoCategorySchema } from './validator';
	import { generateTodoListItemsUrl, type ProjectRouteParams } from '#lib/utils/params/route.js';
	import { getTodoCategories } from '#lib/stores/index.js';

	export type Props = {
		params: ProjectRouteParams;
		form: ActionData;
	};
</script>

<script lang="ts">
	const { params, form }: Props = $props();
	const todoCategoriesStore = getTodoCategories();
</script>

<EnhancedForm
	action="{generateTodoListItemsUrl(params.project_name, params.project_id)}?/createCategory"
	enhancerConfig={{
		validator: { schema: createTodoCategorySchema },
		form: form,
		actionName: 'createCategory',
		invalidateAllAfterSubmit: false
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
			value={params.project_id}
			errors=""
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
