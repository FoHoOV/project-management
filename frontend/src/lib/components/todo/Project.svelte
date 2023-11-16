<script lang="ts">
	import type { Project } from '$lib/client/models';
	import { faBusinessTime, faUser } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

	export let project: Project;
</script>

<div class="card bg-primary text-primary-content">
	<div class="card-body">
		<h2 class="card-title">{project.title}</h2>
		<p>{project.description}</p>

		<div class="stats shadow">
			<div class="stat">
				<div class="stat-figure text-secondary">
					<Fa icon={faUser}></Fa>
				</div>
				<div class="stat-title">Accessed By</div>
				<div class="stat-value">{project.users.length}</div>
				<div class="stat-desc">
					{#each project.users as user}
						{user.username}
					{/each}
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

		<div class="card-actions justify-end">
			<a class="btn" href="/user/{project.id}/todos">show todos</a>
		</div>
	</div>
</div>
