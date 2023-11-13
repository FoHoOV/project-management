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
	import Fa from 'svelte-fa';
	import { callServiceInClient } from '$lib/client-wrapper/wrapper.client';
	import { TodoCategoryClient } from '$lib/client-wrapper/clients';
	import { page } from '$app/stores';
	import todoCategories from '$lib/stores/todos';
	import Error from '$components/Error.svelte';
	import Modal from '$components/popups/Modal.svelte';

	export let category: TodoCategory;
	export { className as class };

	let className: string = '';
	let isCallingService: boolean = false;
	let apiErrorTitle: string | null;
	let createTodoModal: Modal;

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

	function moveDoneTodosToBottom(todos: TodoItem[]) {
		const sortedTodos = todos.sort((a, b) => {
			if (a.is_done == b.is_done) {
				return a.id < b.id ? 1 : -1;
			}

			if (a.is_done) {
				return 1;
			}
			return -1;
		});
		return sortedTodos;
	}

	function handleCreateTodo(event: MouseEvent) {
		createTodoModal.show();
	}
</script>

<div
	class="relative flex max-h-full w-full flex-col items-center overflow-y-auto rounded-xl border border-success-content p-5 {className}"
>
	<Error message={apiErrorTitle} />
	{#if isCallingService}
		<div
			class="align-center absolute left-0.5 top-0.5 z-10 flex h-full w-full justify-center rounded-lg bg-base-300"
		>
			<span class="loading loading-spinner loading-md dark:text-black" />
		</div>
	{/if}
	<div class="mb-5 flex w-full flex-col self-start">
		<div class="flex w-full justify-between">
			<div>
				<Fa icon={faInfoCircle} class="mx-2 inline" />
				<span class="text-lg font-bold">{category.title}</span>
			</div>
			<button on:click={handleRemoveCategory}>
				<Fa icon={faTrashCan} class="text-red-400" />
			</button>
		</div>
		<div>
			<Fa icon={faArrowCircleRight} class="mx-2 inline" />
			<span class="text-lg font-bold">{category.title}</span>
		</div>
	</div>
	<div class="w-full">
		<button class="btn btn-success w-full" on:click={handleCreateTodo}>
			<Fa icon={faCirclePlus} />
			add todo
		</button>
	</div>
	{#if category.items.length > 0}
		{#each moveDoneTodosToBottom(category.items) as todo (todo.id)}
			<div
				class="w-full"
				in:receive={{ key: todo.id }}
				out:send={{ key: todo.id }}
				animate:flip={{ duration: 200 }}
			>
				<TodoItemComponent {todo} />
			</div>
		{/each}
	{:else}
		<h1 class="p-5 text-center">no todos yet!</h1>
	{/if}
</div>

<Modal title="Create a new todo here!" bind:this={createTodoModal}>
	<svelte:fragment slot="body">
		<slot name="create-todo-item" />
	</svelte:fragment>
</Modal>
