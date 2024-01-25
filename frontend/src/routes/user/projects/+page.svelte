<script lang="ts">
	import CircleButton from '$components/buttons/CircleButton.svelte';
	import ProjectList from '$components/project/ProjectList.svelte';
	import CreateProject from '$routes/user/projects/CreateProject.svelte';
	import { faPlus } from '@fortawesome/free-solid-svg-icons';
	import type { ActionData, PageData } from './$types';
	import AttachToUser from '$routes/user/projects/AttachToUser.svelte';
	import EditProject from '$routes/user/projects/EditProject.svelte';
	import type { Project } from '$lib/generated-client/models';
	import projects from '$lib/stores/projects';
	import { browser } from '$app/environment';
	import multiModal from '$lib/stores/multi-modal';
	import { readable } from 'svelte/store';

	export let data: PageData;
	export let form: ActionData;

	function handleCreateProject() {
		multiModal.add({
			component: CreateProject,
			props: readable({ form: form }, (set) => {
				set({ form: form });
			}),
			title: 'Create a new project'
		});
	}

	function handleAttachToUser(e: CustomEvent<{ project: Project }>) {
		multiModal.add({
			component: AttachToUser,
			props: readable({ form: form, projectId: e.detail.project.id }, (set) => {
				set({ form: form, projectId: e.detail.project.id });
			}),
			title: 'Share this project to another user'
		});
	}

	function handleEditProject(e: CustomEvent<{ project: Project }>) {
		multiModal.add({
			component: EditProject,
			props: readable({ form: form, project: e.detail.project }, (set) => {
				set({ form: form, project: e.detail.project });
			}),
			title: 'Edit this project details'
		});
	}
</script>

<svelte:head>
	<title>projects</title>
</svelte:head>

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
