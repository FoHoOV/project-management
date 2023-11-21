<script lang="ts">
	import CircleButton from '$components/buttons/CircleButton.svelte';
	import Modal from '$components/popups/Modal.svelte';
	import ProjectList from '$components/project/ProjectList.svelte';
	import CreateProject from '$routes/user/projects/CreateProject.svelte';
	import { faPlus } from '@fortawesome/free-solid-svg-icons';
	import type { ActionData, PageData } from './$types';
	import Empty from '$components/Empty.svelte';
	import AttachToUser from '$routes/user/projects/AttachToUser.svelte';

	export let data: PageData;
	export let form: ActionData;

	let modal: Modal;

	function handleCreateProject() {
		modal.show();
	}
</script>

{#if data.projects.length == 0}
	<Empty text="Create your first project!" />
{:else}
	<ProjectList projects={data.projects}>
		<AttachToUser
			slot="attach-to-project"
			let:selectedProject
			{form}
			projectId={selectedProject?.id}
		></AttachToUser>
	</ProjectList>
{/if}

<CircleButton
	icon={faPlus}
	class="btn-primary fixed bottom-8 right-8 h-16 w-16"
	on:click={handleCreateProject}
/>

<Modal title="Create a new project">
	<CreateProject {form}></CreateProject>
</Modal>
