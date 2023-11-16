<script lang="ts">
	import CircleButton from '$components/buttons/CircleButton.svelte';
	import Modal from '$components/popups/Modal.svelte';
	import ProjectList from '$components/project/ProjectList.svelte';
	import CreateProject from '$routes/user/projects/CreateProject.svelte';
	import { faPlus } from '@fortawesome/free-solid-svg-icons';
	import type { PageData } from './$types';
	import Empty from '$components/Empty.svelte';

	export let data: PageData;
	let createProject: Modal;
</script>

{#if data.projects.length == 0}
	<Empty class="!justify-start" text="Create your first project!" />
{:else}
	<ProjectList projects={data.projects}></ProjectList>
{/if}

<CircleButton
	icon={faPlus}
	class="btn-primary fixed bottom-8 right-8 h-16 w-16"
	on:click={createProject.show}
/>

<Modal title="Create your projects here!" bind:this={createProject}>
	<svelte:fragment slot="body" let:close let:show>
		<CreateProject />
	</svelte:fragment>
</Modal>
