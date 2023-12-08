<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import Alert from '$components/Alert.svelte';
	import { callServiceInClient } from '$lib/client-wrapper/wrapper.client';
	import { ProjectClient } from '$lib/client-wrapper/clients';
	import type { Project } from '$lib/generated-client/models';
	import { faEdit, faTasks, faUser } from '@fortawesome/free-solid-svg-icons';
	import { createEventDispatcher } from 'svelte';
	import Fa from 'svelte-fa';
	import Spinner from '$components/Spinner.svelte';
	import Modal from '$components/popups/Modal.svelte';

	export let project: Project;

	let state: 'calling-service' | 'none' = 'none';
	let apiErrorTitle: string | null;
	let attachToUserModal: Modal;
	let editProjectModal: Modal;

	async function handleDetachProjectFromUser() {
		state = 'calling-service';
		await callServiceInClient({
			serviceCall: async () => {
				await ProjectClient({ token: $page.data.token }).detachFromUserProject({
					project_id: project.id
				});
				// based on docs invalidate("/user/projects") doesn't work
				await invalidateAll(); // TODO: remove from projects store/runes
				state = 'none';
			},
			errorCallback: async (e) => {
				apiErrorTitle = e.message;
				state = 'none';
			}
		});
	}

	function handleAttachToUser(event: MouseEvent) {
		attachToUserModal.show();
	}

	function handleEditProject(event: MouseEvent) {
		editProjectModal.show();
	}
</script>

<div class="card bg-base-300 text-base-content">
	<div class="card-body">
		<Alert type="error" message={apiErrorTitle} />
		<Spinner visible={state === 'calling-service'}></Spinner>

		<div class="card-title justify-between">
			<div class="flex gap-2">
				<div class="tooltip" data-tip="project id">
					<span>#{project.id}</span>
				</div>
				<span class="block max-w-full truncate hover:text-clip">{project.title}</span>
			</div>
			<button on:click={handleEditProject} class:hidden={!$$slots['edit-project']}>
				<Fa icon={faEdit} class="text-success" />
			</button>
		</div>
		<p class="max-w-full truncate hover:text-clip">{project.description}</p>

		<div class="stats grid-flow-row shadow lg:grid-flow-col">
			<div class="stat">
				<div class="stat-figure text-secondary">
					<Fa icon={faUser}></Fa>
				</div>
				<div class="stat-title">Accessed by</div>
				<div class="stat-value">{project.users.length}</div>
				<div class="stat-desc">
					{project.users.map((user) => user.username).join(', ')}
				</div>
			</div>

			<div class="stat">
				<div class="stat-figure text-secondary">
					<Fa icon={faTasks} />
				</div>
				<div class="stat-title">Status</div>
				<div class="stat-value">
					{project.done_todos_count}/{project.done_todos_count + project.pending_todos_count} done
				</div>
				<div class="stat-desc"></div>
			</div>
		</div>

		<div class="card-actions justify-end pt-3">
			<button
				class="btn btn-success flex-1"
				class:hidden={!$$slots['attach-to-user']}
				on:click={handleAttachToUser}
			>
				Attach to user
			</button>
			<button class="btn btn-error flex-1" on:click={handleDetachProjectFromUser}>
				{#if project.users.length == 1}
					Delete
				{:else}
					Detach
				{/if}
			</button>
			<a
				class="btn btn-info flex-1"
				href="/user/{project.title.replaceAll(' ', '')}-{project.id}/todos"
			>
				Show todos
			</a>
		</div>
	</div>
</div>

<Modal title="Edit project here" bind:this={editProjectModal}>
	<slot slot="body" name="edit-project" {project} />
</Modal>

<Modal title="Give another user access to this project" bind:this={attachToUserModal}>
	<slot slot="body" name="attach-to-user" {project} />
</Modal>
