<script lang="ts" module>
	import FormInput from '#lib/components/forms/FormInput.svelte';
	import LoadingButton from '#lib/components/buttons/LoadingButton.svelte';
	import EnhancedForm from '#lib/components/forms/EnhancedForm.svelte';
	import type { EnhanceOptions } from '#lib/actions/form/index.js';

	import type { ActionData } from './$types';
	import type { Project } from '#lib/generated-client/index.js';
	import { editProjectSchema } from './validator';
	import { getProjects } from '#lib/stores/index.js';

	export type Props = {
		project: Project;
	};
</script>

<script lang="ts">
	const { project }: Props = $props();
	const projectsStore = getProjects();

	const enhancerConfig: EnhanceOptions<typeof editProjectSchema, ActionData, 'edit'> = {
		validator: { schema: editProjectSchema },
		actionName: 'edit',
		resetOnSubmit: false,
		refreshAllAfterSubmit: false
	};
</script>

<EnhancedForm
	action="/user/projects?/edit"
	{enhancerConfig}
	onSubmitSucceeded={async (event) => {
		projectsStore?.update(event.response);
	}}
	successfulMessage="Project edited"
>
	{#snippet inputs({ formErrors })}
		<FormInput
			wrapperClasses="hidden"
			type="hidden"
			name="project_id"
			value={project.id}
			errors=""
		/>
		<FormInput
			name="title"
			autofocus={true}
			wrapperClasses="w-full"
			value={project.title}
			errors={formErrors?.errors?.title}
		/>
		<FormInput
			name="description"
			label="description (Optional)"
			wrapperClasses="w-full"
			value={project.description}
			errors={formErrors?.errors?.description}
		/>
	{/snippet}

	{#snippet actions({ loading })}
		<LoadingButton text="edit" class="btn-success flex-1" type="submit" {loading} />
	{/snippet}
</EnhancedForm>
