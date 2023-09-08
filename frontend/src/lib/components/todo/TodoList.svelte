<script lang="ts">
	import type { TodoItem, TodoCategory } from '$lib/client';
	import { flip } from 'svelte/animate';
	import TodoItemComponent from './TodoItem.svelte';
	import { receive, send } from './transitions';
	import {
		faArrowCircleRight,
		faCirclePlus,
		faInfoCircle,
		faTrashCan
	} from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa/src/fa.svelte';
	import { callServiceInClient } from '$lib/client-wrapper/wrapper.client';
	import { TodoCategoryClient } from '$lib/client-wrapper/clients';
	import { page } from '$app/stores';
	import todoCategories from '$lib/stores/todo-categories';
	import Error from '$components/Error.svelte';

	export let category: TodoCategory;

	let isCallingService: boolean = false;
	let apiErrorTitle: string | null;

	async function handleRemoveCategory() {
		isCallingService = true;
		await callServiceInClient({
			serviceCall: async () => {
				await TodoCategoryClient({ token: $page.data.token }).removeTodoCategory(category);
				todoCategories.removeCategory(category);
				isCallingService = false;
			},
			errorCallback: async (e) => {
				isCallingService = false;
				apiErrorTitle = e.message;
			}
		});
	}

	function sortTodos(todos: TodoItem[]) {
		const filteredTodos = todos.sort((a, b) => {
			if (a.is_done && b.is_done) {
				return 0;
			}
			if (a.is_done) {
				return 1;
			}
			return -1;
		});
		return filteredTodos;
	}
</script>

<div
	class="relative w-full border rounded-xl border-success-content p-5 flex items-center flex-col h-full"
>
	<Error message={apiErrorTitle} />
	{#if isCallingService}
		<div
			class="absolute flex align-center justify-center top-0.5 left-0.5 w-full h-full z-10 bg-base-300 rounded-lg"
		>
			<span class="loading loading-spinner loading-md dark:text-black" />
		</div>
	{/if}
	<div class="flex flex-col self-start w-full mb-5">
		<div class="flex justify-between w-full">
			<div>
				<Fa icon={faInfoCircle} class="inline mx-2" />
				<span class="font-bold text-lg">{category.title}</span>
			</div>
			<button on:click={handleRemoveCategory}>
				<Fa icon={faTrashCan} class="text-red-400" />
			</button>
		</div>
		<div>
			<Fa icon={faArrowCircleRight} class="inline mx-2" />
			<span class="font-bold text-lg">{category.title}</span>
		</div>
	</div>
	<form action="user/todos/?/addTodo" class="w-full">
		<button class="btn btn-success w-full"><Fa icon={faCirclePlus} /> add todo </button>
	</form>
	{#if category.items.length > 0}
		{#each sortTodos(category.items) as todo (todo.id)}
			<div
				in:receive={{ key: todo.id }}
				out:send={{ key: todo.id }}
				animate:flip={{ duration: 200 }}
			>
				<TodoItemComponent {todo} />
			</div>
		{/each}
	{:else}
		<h1 class="text-center p-5">no todos yet!</h1>
	{/if}
</div>
