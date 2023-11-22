<script lang="ts">
	import ProjectComponent from './Project.svelte';
	import type { Project as ProjectType } from '$lib/generated-client/models';
	import Modal from '$components/popups/Modal.svelte';

	export let projects: ProjectType[];

	let selectedProject: ProjectType | undefined;
	let attachToProjectModal: Modal;

	function handleAttachToUser(event: CustomEvent<{ project: ProjectType }>) {
		attachToProjectModal.show();
		selectedProject = event.detail.project;
	}
</script>

<div class="grid grid-cols-1 gap-3 xl:grid-cols-2">
	{#each projects as project}
		<ProjectComponent {project} on:attachToUser={handleAttachToUser}></ProjectComponent>
	{/each}
</div>

<Modal title="Give another user access to this project" bind:this={attachToProjectModal}>
	<slot slot="body" name="attach-to-project" {selectedProject} />
</Modal>
