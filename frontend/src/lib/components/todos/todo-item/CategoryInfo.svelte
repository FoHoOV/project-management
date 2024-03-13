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

<div class="flex flex-row items-center gap-2 overflow-y-auto">
	<span>in category: </span>
	<span class="text-lg font-bold text-info">#{todo.category?.id}</span>
	<span class="whitespace-normal font-bold text-info">{todo.category?.title}</span>
</div>
