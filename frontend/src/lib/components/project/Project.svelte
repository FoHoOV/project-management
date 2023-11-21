<script lang="ts">
	import { invalidate, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import Error from '$components/Error.svelte';
	import { callServiceInClient } from '$lib/client-wrapper/wrapper.client';
	import { ProjectClient } from '$lib/client-wrapper/clients';
	import type { Project } from '$lib/client/models';
	import { faBusinessTime, faUser } from '@fortawesome/free-solid-svg-icons';
	import { createEventDispatcher } from 'svelte';
	import Fa from 'svelte-fa';

	export let project: Project;
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
		<Error message={apiErrorTitle} />

		{#if isCallingService}
			<div
				class="align-center absolute left-0 top-0 z-10 flex h-full w-full justify-center rounded-lg bg-base-300"
			>
				<span class="loading loading-spinner loading-md dark:text-black" />
			</div>
		{/if}

		<div class="card-title">
			<span>#{project.id}</span>
			<span>{project.title}</span>
		</div>
		<p>{project.description}</p>

		<div class="stats shadow">
			<div class="stat">
				<div class="stat-figure text-secondary">
					<Fa icon={faUser}></Fa>
				</div>
				<div class="stat-title">Accessed By</div>
				<div class="stat-value">{project.users.length}</div>
				<div class="stat-desc">
					{project.users.map((user) => user.username).join(', ')}
				</div>
			</div>

			<div class="stat">
				<div class="stat-figure text-secondary">
					<Fa icon={faBusinessTime} />
				</div>
				<div class="stat-title">Categories</div>
				<div class="stat-value">{project.todo_categories.length}</div>
				<div class="stat-desc"></div>
			</div>
		</div>

		<div class="card-actions justify-end pt-3">
			<button class="btn btn-success flex-1" on:click={handleOnAttachToUserClicked}>
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
				>show todos
			</a>
		</div>
	</div>
</div>
