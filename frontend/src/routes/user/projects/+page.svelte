<script lang="ts">
	import CircleButton from '$components/buttons/CircleButton.svelte';
	import Modal from '$components/popups/Modal.svelte';
	import ProjectList from '$components/project/ProjectList.svelte';
	import CreateProject from '$routes/user/projects/CreateProject.svelte';
	import { faPlus } from '@fortawesome/free-solid-svg-icons';
	import type { ActionData, PageData } from './$types';
	import AttachToUser from '$routes/user/projects/AttachToUser.svelte';
	import projects from '$lib/stores/projects/projects';

	export let data: PageData;
	export let form: ActionData;

	let modal: Modal;

	function handleCreateProject() {
		modal.show();
	}

	projects.setProjects(data.projects);
</script>

<ProjectList projects={data.projects}>
	<AttachToUser slot="attach-to-project" let:selectedProject {form} projectId={selectedProject?.id}
	></AttachToUser>
</ProjectList>

<CircleButton
	icon={faPlus}
	class="btn-primary fixed bottom-8 right-8 h-16 w-16"
	on:click={handleCreateProject}
/>

<Modal title="Create a new project" bind:this={modal}>
	<CreateProject slot="body" {form}></CreateProject>
</Modal>
