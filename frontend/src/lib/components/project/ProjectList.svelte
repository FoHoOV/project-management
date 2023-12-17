<script lang="ts" context="module">
	import type { Feature as ProjectFeature } from './Project.svelte';
	export type Feature = ProjectFeature;
</script>

<script lang="ts">
	import ProjectComponent from './Project.svelte';
	import type { Project as ProjectType } from '$lib/generated-client/models';
	import Empty from '$components/Empty.svelte';
	import { flip } from 'svelte/animate';

	export let projects: ProjectType[];
	export let enabledFeatures: Feature[] | null = null;
</script>

{#if projects.length == 0}
	<Empty text="Create your first project!" />
{:else}
	<div class="grid grid-cols-1 gap-3 xl:grid-cols-2">
		{#each projects as project (project.id)}
			<div animate:flip={{ duration: 200 }}>
				<ProjectComponent {project} {enabledFeatures} on:attachToUser on:editProject
				></ProjectComponent>
			</div>
		{/each}
	</div>
{/if}
