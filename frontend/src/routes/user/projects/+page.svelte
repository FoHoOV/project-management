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
	import type { ComponentProps } from 'svelte';
	import projects from '$lib/stores/projects';
	import { browser } from '$app/environment';

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

	let selectedActionProps: ComponentProps<any> | null = null;

	let modals: MultiModal<typeof actions>;

	// TODO: this hack is ugly AF, refactor after svelte5 comes out
	$: selectedActionProps = { ...selectedActionProps, form };

	function handleCreateProject() {
		selectedActionProps = {};
		modals.show('create-project');
	}

	function handleAttachToUser(e: CustomEvent<{ project: Project }>) {
		selectedActionProps = { projectId: e.detail.project.id };
		modals.show('attach-to-user');
	}

	function handleEditProject(e: CustomEvent<{ project: Project }>) {
		selectedActionProps = { project: e.detail.project };
		modals.show('edit-project');
	}
</script>

<ProjectList
	projects={browser ? $projects : data.projects}
	enabledFeatures={['attach-to-user', 'edit-project']}
	on:attachToUser={handleAttachToUser}
	on:editProject={handleEditProject}
></ProjectList>

<CircleButton
	icon={faPlus}
	class="btn-primary fixed bottom-8 right-8 h-16 w-16"
	on:click={handleCreateProject}
/>

<MultiModal
	bind:this={modals}
	class="border border-success border-opacity-20"
	{actions}
	{selectedActionProps}
></MultiModal>
