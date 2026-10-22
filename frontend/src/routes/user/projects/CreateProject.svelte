<script lang="ts" module>
	import FormInput from '#lib/components/forms/FormInput.svelte';
	import LoadingButton from '#lib/components/buttons/LoadingButton.svelte';
	import EnhancedForm from '#lib/components/forms/EnhancedForm.svelte';
	import type { EnhanceOptions } from '#lib/actions/form/index.js';

	import type { ActionData } from './$types';
	import { createProjectSchema } from './validator';
	import { getProjects } from '#lib/stores/index.js';
</script>

<script lang="ts">
	const projectsStore = getProjects();

	const enhancerConfig: EnhanceOptions<typeof createProjectSchema, ActionData, 'create'> = {
		validator: { schema: createProjectSchema },
		actionName: 'create',
		refreshAllAfterSubmit: true
	};
</script>

<EnhancedForm
	action="/user/projects?/create"
	{enhancerConfig}
	onSubmitSucceeded={async (event) => {
		projectsStore?.add(event.response);
	}}
	successfulMessage="Project created"
>
	{#snippet inputs({ formErrors })}
		<FormInput
			name="title"
			wrapperClasses="w-full"
			autofocus={true}
			errors={formErrors?.errors?.title}
		/>
		<FormInput
			name="description"
			label="description (Optional)"
			wrapperClasses="w-full"
			errors={formErrors?.errors?.description}
		/>
		<FormInput
			name="create_from_default_template"
			label="Create from default template?"
			type="checkbox"
			value={true}
			wrapperClasses="w-full !flex-row items-center !justify-start gap-3"
			inputClasses="!checkbox !btn-square !checkbox-success"
			errors={formErrors?.errors?.create_from_default_template?.toString()}
		/>
	{/snippet}

	{#snippet actions({ loading })}
		<LoadingButton text="create" class="btn-success flex-1" type="submit" {loading} />
	{/snippet}
</EnhancedForm>
