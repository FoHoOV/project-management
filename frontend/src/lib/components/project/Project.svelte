<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import Alert from '$components/Alert.svelte';
	import { callServiceInClient } from '$lib/client-wrapper/wrapper.client';
	import { ProjectClient } from '$lib/client-wrapper/clients';
	import type { Project } from '$lib/generated-client/models';
	import { faTasks, faUser } from '@fortawesome/free-solid-svg-icons';
	import { createEventDispatcher } from 'svelte';
	import Fa from 'svelte-fa';

	export let project: Project;
	export let showAttachToUserButton: boolean = false;

	let isCallingService: boolean = false;
	let apiErrorTitle: string | null;
	const dispatch = createEventDispatcher<{ attachToUser: { project: Project } }>();

	async function handleDetachProjectFromUser() {
		isCallingService = true;
		await callServiceInClient({
			serviceCall: async () => {
				await ProjectClient({ token: $page.data.token }).detachFromUserProject({
					project_id: project.id
				});
				// based on docs invalidate("/user/projects") doesn't work
				await invalidateAll(); // TODO: remove from projects store/runes
				isCallingService = false;
			},
			errorCallback: async (e) => {
				isCallingService = false;
				apiErrorTitle = e.message;
			}
		});
	}

	function handleOnAttachToUserClicked(event: MouseEvent) {
		dispatch('attachToUser', { project: project });
	}
</script>

<div class="card bg-base-300 text-base-content">
	<div class="card-body">
		<Alert type="error" message={apiErrorTitle} />

		{#if isCallingService}
			<div
				class="align-center absolute left-0 top-0 z-10 flex h-full w-full justify-center rounded-lg bg-base-300"
			>
				<span class="loading loading-spinner loading-md dark:text-black" />
			</div>
		{/if}

		<div class="card-title">
			<div class="tooltip" data-tip="project id">
				<span>#{project.id}</span>
			</div>
			<span>{project.title}</span>
		</div>
		<p>{project.description}</p>

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
				class:hidden={!showAttachToUserButton}
				on:click={handleOnAttachToUserClicked}
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
