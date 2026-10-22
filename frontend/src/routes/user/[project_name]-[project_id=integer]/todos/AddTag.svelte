<script lang="ts" module>
	import FormInput from '#lib/components/forms/FormInput.svelte';
	import LoadingButton from '#lib/components/buttons/LoadingButton.svelte';
	import EnhancedForm from '#lib/components/forms/EnhancedForm.svelte';
	import type { EnhanceOptions } from '#lib/actions/form/index.js';

	import type { ActionData } from './$types';
	import { addTagSchema } from './validator';
	import { generateTodoListItemsUrl, type ProjectRouteParams } from '#lib/utils/params/route.js';
	import { getTodoCategories } from '#lib/stores/index.js';

	export type Props = {
		params: ProjectRouteParams;
		todoId: number;
	};
</script>

<script lang="ts">
	const { params, todoId }: Props = $props();
	const todoCategoriesStore = getTodoCategories();

	const enhancerConfig: EnhanceOptions<typeof addTagSchema, ActionData, 'addTag'> = {
		validator: { schema: addTagSchema },
		actionName: 'addTag',
		refreshAllAfterSubmit: false
	};
</script>

<EnhancedForm
	action="{generateTodoListItemsUrl(params.project_name, params.project_id)}?/addTag"
	{enhancerConfig}
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
			errors=""
			type="hidden"
		/>
		<FormInput
			name="project_id"
			label="project id"
			hideLabel={true}
			value={params.project_id}
			type="hidden"
			errors=""
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
