<script lang="ts" module>
	import MultiStepModal from '#lib/components/popups/MultiStepModal.svelte';
	import CircleButton from '#lib/components/buttons/CircleButton.svelte';
	import ProjectList from '#lib/components/project/ProjectList.svelte';
	import CreateProject from './CreateProject.svelte';
	import AttachToUser from './AttachToUser.svelte';
	import EditProject from './EditProject.svelte';

	import { faPlus } from '@fortawesome/free-solid-svg-icons';
	import type { Project } from '#lib/generated-client/index.js';
	import {
		getProjects,
		setMultiStepModal,
		MultiStepModal as MultiStepModalStore
	} from '#lib/stores/index.js';
</script>

<script lang="ts">
	const projectsStore = getProjects();
	const multiStepModalStore = setMultiStepModal(new MultiStepModalStore([], false));

	if (!projectsStore) {
		throw new window.Error('projects store must have a value for this page to work!');
	}

	function handleCreateProject() {
		multiStepModalStore.add({
			component: CreateProject,
			props: () => {
				return {};
			},
			title: 'Create a new project'
		});
	}

	function handleAttachToUser(project: Project) {
		multiStepModalStore.add({
			component: AttachToUser,
			props: () => {
				return { project };
			},
			title: 'Share this project with another user'
		});
	}

	function handleEditProject(project: Project) {
		multiStepModalStore.add({
			component: EditProject,
			props: () => {
				return { project };
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

<MultiStepModal class="border border-success border-opacity-20"></MultiStepModal>
