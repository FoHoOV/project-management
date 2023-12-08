<script lang="ts">
	import ProjectComponent from './Project.svelte';
	import type { Project as ProjectType } from '$lib/generated-client/models';
	import Empty from '$components/Empty.svelte';

	export let projects: ProjectType[];
</script>

{#if projects.length == 0}
	<Empty text="Create your first project!" />
{:else}
	<div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
		{#each projects as project}
			<ProjectComponent {project}>
				<!--for slot forwarding to work flawlessly I have to wait for svelte5-->
				<!--right now although this slot could be empty but the ProjectComponent thinks it has value and will render additional HTML-->
				<!--https://github.com/sveltejs/svelte/pull/8304-->
				<slot slot="edit-project" name="edit-project" let:project {project} />
				<slot slot="attach-to-user" name="attach-to-user" let:project {project} />
			</ProjectComponent>
		{/each}
	</div>
{/if}
