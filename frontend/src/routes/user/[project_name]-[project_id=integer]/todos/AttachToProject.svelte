<script lang="ts" module>
	import FormInput from '#lib/components/forms/FormInput.svelte';
	import LoadingButton from '#lib/components/buttons/LoadingButton.svelte';
	import EnhancedForm from '#lib/components/forms/EnhancedForm.svelte';
	import type { EnhanceOptions } from '#lib/actions/form/index.js';

	import type { ActionData } from './$types';
	import { attachToProjectSchema } from './validator';
	import { generateTodoListItemsUrl, type ProjectRouteParams } from '#lib/utils/params/route.js';

	export type Props = {
		params: ProjectRouteParams;
		categoryId: number;
	};
</script>

<script lang="ts">
	const { params, categoryId }: Props = $props();

	const enhancerConfig: EnhanceOptions<
		typeof attachToProjectSchema,
		ActionData,
		'attachToProject'
	> = {
		validator: { schema: attachToProjectSchema },
		actionName: 'attachToProject'
	};
</script>

<EnhancedForm
	action="{generateTodoListItemsUrl(params.project_name, params.project_id)}?/attachToProject"
	{enhancerConfig}
	successfulMessage="Todo category is now shared with the specified project"
>
	{#snippet inputs({ formErrors })}
		<FormInput
			name="category_id"
			wrapperClasses="hidden"
			value={categoryId}
			errors=""
			type="hidden"
		/>
		<FormInput
			name="project_id"
			label="project id"
			wrapperClasses="w-full"
			autofocus={true}
			errors={typeof formErrors?.errors?.project_id === 'number'
				? formErrors.errors.project_id.toString()
				: formErrors?.errors?.project_id}
		/>
	{/snippet}

	{#snippet actions({ loading })}
		<LoadingButton text="attach" class="btn-success flex-1" type="submit" {loading} />
	{/snippet}
</EnhancedForm>
