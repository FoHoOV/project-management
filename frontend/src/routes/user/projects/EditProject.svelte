<script lang="ts" context="module">
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import EnhancedForm from '$components/forms/EnhancedForm.svelte';

	import type { ActionData } from './$types';
	import type { Project } from '$lib/generated-client/models';
	import { editProjectSchema } from './validator';
	import { getProjectsStoreFromContext } from '$components/project/utils';

	export type Props = {
		form: ActionData;
		project: Project;
	};
</script>

<script lang="ts">
	const { form, project } = $props<Props>();
	const projectsStore = getProjectsStoreFromContext();
</script>

<EnhancedForm
	action="/user/projects?/edit"
	enhancerConfig={{
		validator: { schema: editProjectSchema },
		form: form,
		action: 'edit'
	}}
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
			errors={''}
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
