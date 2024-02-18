<script lang="ts" context="module">
	import ProjectComponent, { type Events as ProjectEvents } from './Project.svelte';
	import Empty from '$components/Empty.svelte';

	import type { Project as ProjectModel } from '$lib/generated-client/models';
	import { flip } from 'svelte/animate';

	export type Events = ProjectEvents;

	export type Props = {
		projects: ProjectModel[];
	} & Events;
</script>

<script lang="ts">
	const { projects, ...restProps } = $props<Props>();
</script>

<div class="grid grid-cols-1 gap-3 xl:grid-cols-2">
	{#each projects as project (project.id)}
		<div animate:flip={{ duration: 200 }}>
			<ProjectComponent {project} {...restProps}></ProjectComponent>
		</div>
	{:else}
		<Empty class="col-span-1 xl:col-span-2" text="Create your first project!" />
	{/each}
</div>
