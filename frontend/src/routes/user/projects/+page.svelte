<script lang="ts">
	import CircleButton from '$components/buttons/CircleButton.svelte';
	import Modal from '$components/popups/Modal.svelte';
	import ProjectList from '$components/project/ProjectList.svelte';
	import CreateProject from '$routes/user/projects/CreateProject.svelte';
	import { faPlus } from '@fortawesome/free-solid-svg-icons';
	import type { ActionData, PageData } from './$types';
	import AttachToUser from '$routes/user/projects/AttachToUser.svelte';
	import EditProject from '$routes/user/projects/EditProject.svelte';
	import type { Project } from '$lib/generated-client/models';
	import MultiModal from '$components/popups/MultiModal.svelte';

	export let data: PageData;
	export let form: ActionData;

	let actions = [
		{ component: CreateProject, name: 'create-project', title: 'Create projects here!' },
		{
			component: AttachToUser,
			name: 'attach-to-user',
			title: 'Attach this project to another user'
		},
		{ component: EditProject, name: 'edit-project', title: 'Edit this projects info!' }
	] as const;

	let modals: MultiModal<typeof actions>;

	function handleCreateProject() {
		modals.show('create-project', { form: form });
	}

	function handleAttachToUser(e: CustomEvent<{ project: Project }>) {
		modals.show('attach-to-user', { form: form, projectId: e.detail.project.id });
	}

	function handleEditProject(e: CustomEvent<{ project: Project }>) {
		modals.show('edit-project', { form: form, projectId: e.detail.project.id });
	}
</script>

<ProjectList
	projects={data.projects}
	enabledFeatures={['attach-to-user', 'edit-project']}
	on:attachToUser={handleAttachToUser}
	on:editProject={handleEditProject}
></ProjectList>

<CircleButton
	icon={faPlus}
	class="btn-primary fixed bottom-8 right-8 h-16 w-16"
	on:click={handleCreateProject}
/>

<MultiModal bind:this={modals} {actions}></MultiModal>
