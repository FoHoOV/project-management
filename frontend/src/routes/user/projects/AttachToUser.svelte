<script lang="ts" context="module">
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import EnhancedForm from '$components/forms/EnhancedForm.svelte';

	import type { ActionData } from './$types';
	import { attachProjectSchema } from './validator';
	import type { Project } from '$lib/generated-client/models';
	import { getProjectsStoreFromContext } from '$components/project/utils';

	export type Props = {
		form: ActionData;
		project: Project;
	};
</script>

<script lang="ts">
	import Permissions from '$components/project/Permissions.svelte';

	const { form, project } = $props<Props>();

	const projectsStore = getProjectsStoreFromContext();
</script>

<EnhancedForm
	action="/user/projects?/attach"
	enhancerConfig={{
		validator: { schema: attachProjectSchema },
		form: form,
		action: 'attach'
	}}
	onSubmitSucceeded={async (event) => {
		projectsStore?.addAssociation(project, {
			username: event.formData.username,
			id: event.response.user_id
		});
	}}
	successfulMessage="Project is now shared with the specified user"
>
	{#snippet inputs({ formErrors })}
		<Permissions></Permissions>
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
			autoFocus={true}
			errors={formErrors?.errors?.username}
		/>
	{/snippet}

	{#snippet actions({ loading })}
		<LoadingButton text="share" class="btn-success flex-1" type="submit" {loading} />
	{/snippet}
</EnhancedForm>
