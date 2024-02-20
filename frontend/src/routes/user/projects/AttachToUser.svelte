<script lang="ts" context="module">
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import EnhancedForm from '$components/forms/EnhancedForm.svelte';

	import type { ActionData } from './$types';
	import { attachProjectSchema } from './validator';
	import { Permission, type Project } from '$lib/generated-client/models';
	import { getProjectsStoreFromContext } from '$components/project/utils';

	export type Props = {
		form: ActionData;
		project: Project;
	};
</script>

<script lang="ts">
	const { form, project } = $props<Props>();

	const projectsStore = getProjectsStoreFromContext();
	let allowAllAccessRights = $state<boolean>(false);
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
		<span> permissions </span>
		<FormInput
			id="permissions:{Permission.All}"
			name="permissions[]"
			value={Permission.All}
			label="Allow all permissions"
			type="checkbox"
			inputClasses="checkbox-warning"
			labelClasses="border border-info"
			onchange={(e)=>{
				allowAllAccessRights = (e.target as HTMLInputElement).checked;
			}}
		></FormInput>
		<div class="grid grid-cols-1 gap-2 lg:grid-cols-2">
			{#each Object.values(Permission).filter((value) => value !== Permission.All) as permission}
				<FormInput
					id="permissions:{permission}"
					name="permissions[]"
					value={permission}
					label={permission.replaceAll('_', ' ')}
					type="checkbox"
					disabled={allowAllAccessRights}
					inputClasses="checkbox-warning"
					labelClasses="border border-info"
				></FormInput>
			{/each}
		</div>

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
