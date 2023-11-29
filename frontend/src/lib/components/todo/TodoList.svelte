<script lang="ts">
	import type { TodoItem, TodoCategory } from '$lib/generated-client';
	import { flip } from 'svelte/animate';
	import TodoItemComponent from './TodoItem.svelte';
	import { receive, send } from './transitions';
	import {
		faArrowCircleRight,
		faCirclePlus,
		faInfoCircle,
		faMapPin,
		faTrashCan
	} from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import { callServiceInClient } from '$lib/client-wrapper/wrapper.client';
	import { TodoCategoryClient, TodoItemClient } from '$lib/client-wrapper/clients';
	import { page } from '$app/stores';
	import todoCategories from '$lib/stores/todos';
	import { dropzone, type DropEvent } from '$lib/actions';
	import Alert from '$components/Alert.svelte';
	import Modal from '$components/popups/Modal.svelte';
	import Empty from '$components/Empty.svelte';
	import { TodoItem as TodoItemSchema } from '$lib/generated-client/zod/schemas';

	export let category: TodoCategory;
	export let projectId: number;
	export { className as class };

	let className: string = '';
	let isCallingService: boolean = false;
	let apiErrorTitle: string | null;
	let createTodoModal: Modal;
	let attachToProjectModal: Modal;

	async function handleRemoveCategory() {
		isCallingService = true;
		await callServiceInClient({
			serviceCall: async () => {
				await TodoCategoryClient({ token: $page.data.token }).detachFromProjectTodoCategory({
					category_id: category.id,
					project_id: projectId
				});
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

	function handleAttachToProject(event: MouseEvent) {
		attachToProjectModal.show();
	}

	function handleTodoItemDropped(event: DropEvent<TodoItem>) {
		// I know the typings of model is a hack
		// but I have to wait so that svelte natively supports ts in markup
		isCallingService = true;
		callServiceInClient({
			serviceCall: async () => {
				await TodoItemClient({ token: $page.data.token }).updateTodoItem({
					...event.detail.data,
					new_category_id: category.id
				});
				todoCategories.removeTodo(event.detail.data);
				todoCategories.addTodo({ ...event.detail.data, category_id: category.id });
				isCallingService = false;
			},
			errorCallback: async (e) => {
				isCallingService = false;
				apiErrorTitle = e.message;
			}
		});
	}
</script>

<div
	use:dropzone={{ model: category.items[0], type: 'TodoItemDropZone' }}
	on:dropped={handleTodoItemDropped}
	class="relative flex max-h-full w-full flex-col items-center overflow-y-auto rounded-xl border border-base-300 p-5 {className}"
>
	<Alert type="error" message={apiErrorTitle} />
	{#if isCallingService}
		<div
			class="align-center absolute left-0.5 top-0.5 z-10 flex h-full w-full justify-center rounded-lg bg-base-300"
		>
			<span class="loading loading-spinner loading-md dark:text-black" />
		</div>
	{/if}
	<div class="flex w-full flex-col self-start">
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
	<div class="mt-2 flex w-full gap-2">
		<button
			class="btn btn-success flex-1"
			class:hidden={!$$slots['create-todo-item']}
			on:click={handleCreateTodo}
		>
			<Fa icon={faCirclePlus} />
			Add todo
		</button>
		<button
			class="btn btn-info flex-1"
			class:hidden={!$$slots['attach-to-project']}
			on:click={handleAttachToProject}
		>
			<Fa icon={faMapPin} />
			Add to project
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
		<Empty class="mt-2 w-full justify-start" text="Add your first todo!" />
	{/if}
</div>

<Modal title="Create a new todo here!" bind:this={createTodoModal}>
	<svelte:fragment slot="body">
		<slot name="create-todo-item" />
	</svelte:fragment>
</Modal>

<Modal title="Attach to project!" bind:this={attachToProjectModal}>
	<svelte:fragment slot="body">
		<slot name="attach-to-project" />
	</svelte:fragment>
</Modal>
