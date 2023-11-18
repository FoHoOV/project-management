<script lang="ts">
	import CircleButton from '$components/buttons/CircleButton.svelte';
	import Modal from '$components/popups/Modal.svelte';
	import ProjectList from '$components/project/ProjectList.svelte';
	import CreateProject from '$routes/user/projects/CreateProject.svelte';
	import { faPlus } from '@fortawesome/free-solid-svg-icons';
	import type { ActionData, PageData } from './$types';
	import Empty from '$components/Empty.svelte';
	import type { ComponentType } from 'svelte';
	import AttachToUser from '$routes/user/projects/AttachToUser.svelte';
	import type { Project } from '$lib';

	export let data: PageData;
	export let form: ActionData;

	let modal: Modal;
	let selectedProject: Project | undefined;
	let currentModal: { component: ComponentType; title: string } | undefined;

	function handleAttachToUser(event: CustomEvent<{ project: Project }>) {
		modal.show();
		currentModal = { component: AttachToUser, title: 'Give another user access to this project' };
		selectedProject = event.detail.project;
	}

	function handleCreateProject() {
		modal.show();
		currentModal = { component: CreateProject, title: 'Create a new project' };
	}
</script>

{#if data.projects.length == 0}
	<Empty text="Create your first project!" />
{:else}
	<ProjectList projects={data.projects} on:attachToUser={handleAttachToUser}></ProjectList>
{/if}

<CircleButton
	icon={faPlus}
	class="btn-primary fixed bottom-8 right-8 h-16 w-16"
	on:click={handleCreateProject}
/>

<Modal title={currentModal?.title} bind:this={modal}>
	<svelte:component
		this={currentModal?.component}
		slot="body"
		let:close
		let:show
		projectId={selectedProject?.id}
		{form}
	></svelte:component>
</Modal>
