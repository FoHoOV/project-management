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
	let modalComponent: ComponentType;

	function handleAttachToUser(event: CustomEvent<{ project: Project }>) {
		modal.show();
		modalComponent = AttachToUser;
		selectedProject = event.detail.project;
	}

	function handleCreateProject() {
		modal.show();
		modalComponent = CreateProject;
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

<Modal title="Create your projects here!" bind:this={modal}>
	<svelte:component
		this={modalComponent}
		slot="body"
		let:close
		let:show
		projectId={selectedProject?.id}
		{form}
	></svelte:component>
</Modal>
