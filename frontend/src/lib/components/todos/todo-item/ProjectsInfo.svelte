<script lang="ts" context="module">
	import type { StrictUnion } from '$lib';
	import type { TodoItem, TodoCategoryPartialTodoItem } from '$lib/generated-client';

	export type Props = {
		todo: StrictUnion<TodoItem | TodoCategoryPartialTodoItem>;
	};
</script>

<script lang="ts">
	const { todo }: Props = $props();
</script>

<div>
	<span>in projects: </span>
	{#each todo.category?.projects || [] as project}
		<div class="inline-flex flex-row items-center gap-1 overflow-y-auto px-1">
			(
			<span class="text-lg font-bold text-info">#{project.id}</span>
			-
			<span class="max-w-full font-bold text-info">{project.title}</span>
			)
		</div>
	{/each}
</div>
