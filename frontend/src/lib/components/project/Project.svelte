<script lang="ts" context="module">
	import Alert from '$components/alerts/Alert.svelte';
	import Fa from 'svelte-fa';
	import Spinner from '$components/Spinner.svelte';

	import { page } from '$app/stores';
	import { callServiceInClient } from '$lib/client-wrapper/wrapper.client';
	import { ProjectClient } from '$lib/client-wrapper/clients';
	import type { Project } from '$lib/generated-client/models';
	import { faEdit, faTasks, faUser } from '@fortawesome/free-solid-svg-icons';
	import { generateTodoListItemsUrl } from '$lib/utils/params/route';
	import Confirm from '$components/Confirm.svelte';
	import { type CommonComponentStates } from '$lib';
	import { getProjects } from '$lib/stores';

	export type Events = {
		onEditProject?: (project: Project) => void;
		onAttachToUser?: (project: Project) => void;
	};
	export type Props = {
		project: Project;
	} & Events;
</script>

<script lang="ts">
	const { project, onEditProject, onAttachToUser }: Props = $props();

	let componentState = $state<CommonComponentStates>('none');
	let apiErrorTitle = $state<string | null>(null);
	let confirmDetachProject = $state<Confirm | null>(null);

	const projectsStore = getProjects();

	async function handleDetachProjectFromUser() {
		componentState = 'calling-service';
		await callServiceInClient({
			call: async () => {
				await ProjectClient({ token: $page.data.token }).detachFromSelfProjects(project.id);
				projectsStore?.remove(project);
				componentState = 'none';
				apiErrorTitle = null;
			},
			errorHandler: async (e) => {
				apiErrorTitle = e.message;
				componentState = 'none';
			}
		});
	}
</script>

<div
	class="card relative border border-transparent border-opacity-10 bg-base-300 text-base-content transition-colors hover:border-primary"
	data-testid="project-item-wrapper"
>
	<div class="card-body">
		<Alert type="error" message={new String(apiErrorTitle)} />
		<Spinner visible={componentState === 'calling-service'}></Spinner>
		<Confirm bind:this={confirmDetachProject} onConfirmed={handleDetachProjectFromUser}></Confirm>
		<div class="card-title justify-between">
			<div class="flex items-baseline gap-2">
				<div class="tooltip tooltip-info" data-tip="project id">
					<span class="text-info">#{project.id}</span>
				</div>
				<span class="break-words-legacy block max-w-full whitespace-normal break-words"
					>{project.title}</span
				>
			</div>
			<button onclick={() => onEditProject?.(project)} class:hidden={!onEditProject}>
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

		<div class="card-actions pt-3">
			<div class="grid w-full grid-cols-2 gap-2 sm:grid-cols-3">
				<button
					class="btn btn-success"
					onclick={() => onAttachToUser?.(project)}
					class:hidden={!onAttachToUser}
					data-testid="share-project-access"
				>
					Share access
				</button>
				<button
					class="btn btn-error"
					onclick={() => confirmDetachProject?.show()}
					data-testid="detach-project"
				>
					{#if project.users.length == 1}
						Delete
					{:else}
						Detach
					{/if}
				</button>
				<a
					class="btn btn-info col-span-2 sm:col-span-1"
					href={generateTodoListItemsUrl(project.title, project.id)}
				>
					Show todos
				</a>
			</div>
		</div>
	</div>
</div>
