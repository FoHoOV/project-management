<script lang="ts">
	import { onMount } from 'svelte';
	import type { LayoutData } from './$types';
	import NavbarItem from '$components/navbar/NavbarItem.svelte';
	import { generateTodoListUrl } from '$lib/utils/params/route';
	import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
	import projects from '$lib/stores/projects';
	import Fragment from '$components/Fragment.svelte';

	export let data: LayoutData;

	onMount(() => {
		projects.setProjects(data.projects);
	});
</script>

<Fragment slot="nav-project-list">
	<ul let:closeDrawer>
		{#each data.projects as project (project.id)}
			<NavbarItem
				icon={faArrowRight}
				href={generateTodoListUrl(project.title, project.id)}
				name={project.title}
				on:click={closeDrawer}
			/>
		{/each}
	</ul>
</Fragment>

<slot />
