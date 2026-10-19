<script lang="ts" module>
	import FormInput from '#lib/components/forms/FormInput.svelte';
	import LoadingButton from '#lib/components/buttons/LoadingButton.svelte';
	import EnhancedForm from '#lib/components/forms/EnhancedForm.svelte';

	import type { ActionData } from './$types';
	import type { TodoItemPartialTag } from '#lib/generated-client/index.js';
	import { generateTodoListItemsUrl, type ProjectRouteParams } from '#lib/utils/params/route.js';
	import { editTagSchema } from './validator';
	import { getTodoCategories } from '#lib/stores/index.js';

	export type Props = {
		params: ProjectRouteParams;
		form: ActionData;
		tag: TodoItemPartialTag;
	};
</script>

<script lang="ts">
	const { params, form, tag }: Props = $props();
	const todoCategoriesStore = getTodoCategories();
</script>

<EnhancedForm
	action="{generateTodoListItemsUrl(params.project_name, params.project_id)}?/editTag"
	enhancerConfig={{
		validator: { schema: editTagSchema },
		form: form,
		actionName: 'editTag',
		resetOnSubmit: false,
		invalidateAllAfterSubmit: false
	}}
	onSubmitSucceeded={async (event) => {
		todoCategoriesStore?.updateTag(event.response);
	}}
	successfulMessage="Todo tag edited"
>
	{#snippet inputs({ formErrors })}
		<FormInput
			wrapperClasses="hidden"
			type="hidden"
			name="project_id"
			value={tag.project_id}
			errors=""
		/>
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
