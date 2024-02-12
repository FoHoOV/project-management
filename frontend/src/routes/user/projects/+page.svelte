<script lang="ts">
	import CircleButton from '$components/buttons/CircleButton.svelte';
	import ProjectList from '$components/project/ProjectList.svelte';
	import CreateProject from '$routes/user/projects/CreateProject.svelte';
	import { faPlus } from '@fortawesome/free-solid-svg-icons';
	import AttachToUser from '$routes/user/projects/AttachToUser.svelte';
	import EditProject from '$routes/user/projects/EditProject.svelte';
	import type { Project } from '$lib/generated-client/models';
	import { projects } from '$lib/stores/projects';
	import { multiStepModal } from '$lib/stores/multi-step-modal/index';
	import { browser } from '$app/environment';

	const { data, form } = $props();

	const environmentSpecificProjects = $derived(browser ? projects.current : data.projects);

	function handleCreateProject() {
		multiStepModal.add({
			component: CreateProject,
			props: () => {
				return { form: form };
			},
			title: 'Create a new project'
		});
	}

	function handleAttachToUser(e: CustomEvent<{ project: Project }>) {
		multiStepModal.add({
			component: AttachToUser,
			props: () => {
				return { form: form, projectId: e.detail.project.id };
			},
			title: 'Share this project with another user'
		});
	}

	function handleEditProject(e: CustomEvent<{ project: Project }>) {
		multiStepModal.add({
			component: EditProject,
			props: () => {
				return { form: form, project: e.detail.project };
			},
			title: 'Edit this project details'
		});
	}
</script>

<svelte:head>
	<title>projects</title>
</svelte:head>

<ProjectList
	projects={environmentSpecificProjects}
	enabledFeatures={['attach-to-user', 'edit-project']}
	on:attachToUser={handleAttachToUser}
	on:editProject={handleEditProject}
></ProjectList>

<CircleButton
	icon={faPlus}
	class="btn-primary fixed bottom-8 right-8 h-16 w-16"
	on:click={handleCreateProject}
/>
