<script lang="ts">
	import type { Todo } from '$lib/client';
	import { flip } from 'svelte/animate';
	import TodoItem from './TodoItem.svelte';
	import { receive, send } from './transitions';

	export let todos: Todo[];
	export let done: boolean = false;

	function filterAndSortTodos(todos: Todo[], done: boolean) {
		const filteredTodos = todos.filter((todo) => todo.is_done == done);
		if (done) {
			return filteredTodos.reverse();
		}
		return filteredTodos;
	}
</script>

{#if todos.length > 0}
	{#each filterAndSortTodos(todos, done) as todo (todo.id)}
		<div
			class="card bg-base-200 hover:bg-base-100 shadow-xl mt-4"
			in:receive={{ key: todo.id }}
			out:send={{ key: todo.id }}
			animate:flip={{ duration: 200 }}
		>
			<TodoItem {todo} />
		</div>
	{/each}
{:else}
	<h1 class="text-center">no todos yet!</h1>
{/if}
