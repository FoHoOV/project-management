<script lang="ts" module>
	import CircleButton from '$components/buttons/CircleButton.svelte';
	import ProjectList from '$components/project/ProjectList.svelte';
	import CreateProject from '$routes/user/projects/CreateProject.svelte';
	import AttachToUser from '$routes/user/projects/AttachToUser.svelte';
	import EditProject from '$routes/user/projects/EditProject.svelte';

	import { faPlus } from '@fortawesome/free-solid-svg-icons';
	import type { Project } from '$lib/generated-client/models';
	import { getMultiStepModal, getProjects } from '$lib/stores';
</script>

<script lang="ts">
	const { data, form } = $props();

	const projectsStore = getProjects();
	const multiStepModalStore = getMultiStepModal();

	if (!projectsStore) {
		throw new window.Error('projects store must have a value for this page to work!');
	}

	function handleCreateProject() {
		multiStepModalStore.add({
			component: CreateProject,
			props: () => {
				return { form };
			},
			title: 'Create a new project'
		});
	}

	function handleAttachToUser(project: Project) {
		multiStepModalStore.add({
			component: AttachToUser,
			props: () => {
				return { form, project };
			},
			title: 'Share this project with another user'
		});
	}

	function handleEditProject(project: Project) {
		multiStepModalStore.add({
			component: EditProject,
			props: () => {
				return { form, project };
			},
			title: 'Edit this project details'
		});
	}
</script>

<svelte:head>
	<title>projects</title>
</svelte:head>

<ProjectList
	projects={projectsStore?.value$}
	onAttachToUser={handleAttachToUser}
	onEditProject={handleEditProject}
></ProjectList>

<CircleButton
	icon={faPlus}
	class="btn-primary fixed bottom-8 right-8 h-16 w-16"
	onclick={handleCreateProject}
/>
