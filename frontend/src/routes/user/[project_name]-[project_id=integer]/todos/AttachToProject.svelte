<script lang="ts" context="module">
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import EnhancedForm from '$components/forms/EnhancedForm.svelte';

	import type { ActionData } from './$types';
	import { attachToProjectSchema } from './validator';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';
	import { generateTodoListUrl } from '$lib/utils/params/route';

	export type Props = {
		form: ActionData;
		categoryId: number;
	};
</script>

<script lang="ts">
	const { form, categoryId } = $props<Props>();
</script>

<EnhancedForm
	action="{generateTodoListUrl(
		$page.params.project_name,
		$page.params.project_id
	)}?/attachToProject"
	enhancerConfig={{
		validator: { schema: attachToProjectSchema },
		form: form,
		action: 'attachToProject'
	}}
	onSubmitSucceeded={async (event) => {
		await invalidate(`${generateTodoListUrl($page.params.project_name, $page.params.project_id)}`);
	}}
	successfulMessage="Todo category is now shared with the specified project"
>
	{#snippet inputs({ formErrors })}
		<FormInput
			name="category_id"
			wrapperClasses="hidden"
			value={categoryId}
			errors={''}
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
