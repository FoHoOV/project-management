<script lang="ts" context="module">
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import EnhancedForm from '$components/forms/EnhancedForm.svelte';
	import ProjectPermissions from '$components/project/ProjectPermissions.svelte';

	import type { ActionData } from './$types';
	import { attachProjectSchema } from './validator';
	import { type Project } from '$lib/generated-client/models';
	import { getProjectsStoreFromContext } from '$components/project/utils';

	export type Props = {
		form: ActionData;
		project: Project;
	};
</script>

<script lang="ts">
	const { form, project }: Props = $props();

	const projectsStore = getProjectsStoreFromContext();
</script>

<EnhancedForm
	action="/user/projects?/attach"
	enhancerConfig={{
		validator: { schema: attachProjectSchema },
		form: form,
		action: 'attach',
		resetOnSubmit: false,
		invalidateAllAfterSubmit: false
	}}
	onSubmitSucceeded={async (event) => {
		projectsStore?.addAssociation(project, {
			username: event.parsedFormData.username,
			permissions: event.parsedFormData.permissions,
			id: event.response.user_id
		});
	}}
	successfulMessage="Project is now shared with the specified user"
>
	{#snippet inputs({ formErrors })}
		<span> permissions </span>
		<ProjectPermissions></ProjectPermissions>

		<FormInput
			name="project_id"
			wrapperClasses="w-full"
			hideLabel={true}
			value={project.id}
			errors={''}
			type="hidden"
		/>
		<FormInput
			name="username"
			wrapperClasses="w-full"
			autofocus={true}
			errors={formErrors?.errors?.username}
		/>
	{/snippet}

	{#snippet actions({ loading })}
		<LoadingButton text="share" class="btn-success flex-1" type="submit" {loading} />
	{/snippet}
</EnhancedForm>
