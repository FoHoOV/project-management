<script lang="ts">
	import Project from './Project.svelte';
	import type { Project as ProjectType } from '$lib/client/models';

	export let projects: ProjectType[];
</script>

<div class="grid grid-cols-1 gap-3 xl:grid-cols-2">
	{#each projects as project}
		<Project {project} on:attachToUser></Project>
	{/each}
</div>
