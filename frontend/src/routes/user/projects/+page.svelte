<script lang="ts">
	import ProjectList from '$components/todo/ProjectList.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<ProjectList projects={data.projects}></ProjectList>
