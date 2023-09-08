<script lang="ts">
	import type { TodoItem, TodoCategory } from '$lib/client';
	import { flip } from 'svelte/animate';
	import TodoItemComponent from './TodoItem.svelte';
	import { receive, send } from './transitions';

	export let category: TodoCategory;
	export let done: boolean = false;

	function filterAndSortTodos(todos: TodoItem[], done: boolean) {
		const filteredTodos = todos.filter((todo) => todo.is_done == done);
		if (done) {
			return filteredTodos.reverse();
		}
		return filteredTodos;
	}
</script>

{#if category.todos.length > 0}
	{#each filterAndSortTodos(category.todos, done) as todo (todo.id)}
		<div
			class="border"
			in:receive={{ key: todo.id }}
			out:send={{ key: todo.id }}
			animate:flip={{ duration: 200 }}
		>
			<TodoItemComponent {todo} />
		</div>
	{/each}
{:else}
	<h1 class="text-center">no todos yet!</h1>
{/if}
