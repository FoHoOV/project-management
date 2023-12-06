<script lang="ts">
	import type { TodoItem, TodoCategory, Project } from '$lib/generated-client';
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
	import todos from '$lib/stores/todos';
	import { dropzone, type DropEvent, draggable, type CustomDragEvent } from '$lib/actions';
	import Alert from '$components/Alert.svelte';
	import Modal from '$components/popups/Modal.svelte';
	import Empty from '$components/Empty.svelte';
	import {
		DROP_EVENT_HANDLED_BY_TODO_ITEM,
		TODO_CATEGORY_ORDER_DROP_ZONE,
		TODO_ITEM_NEW_CATEGORY_DROP_ZONE_NAME
	} from '$components/todo/constants';
	import Spinner from '$components/Spinner.svelte';
	import { cursorOnElementPositionX } from '$lib/utils';
	import DropZoneHelper from '$components/todo/DropZoneHelper.svelte';
	import { generateNewOrderForTodoCategory } from '$components/todo/utils';

	export let category: TodoCategory;
	export let project: Project;
	export { className as class };

	let className: string = '';
	let state: 'drop-zone-left-activated' | 'drop-zone-right-activated' | 'calling-service' | 'none' =
		'none';
	let apiErrorTitle: string | null;
	let createTodoModal: Modal;
	let attachToProjectModal: Modal;

	async function handleRemoveCategory() {
		state = 'calling-service';
		await callServiceInClient({
			serviceCall: async () => {
				await TodoCategoryClient({ token: $page.data.token }).detachFromProjectTodoCategory({
					category_id: category.id,
					project_id: project.id
				});
				todos.removeCategory(category);
				state = 'none';
			},
			errorCallback: async (e) => {
				apiErrorTitle = e.message;
				state = 'none';
			}
		});
	}

	function handleCreateTodo(event: MouseEvent) {
		createTodoModal.show();
	}

	function handleAttachToProject(event: MouseEvent) {
		attachToProjectModal.show();
	}

	async function handleOnDrop(event: DropEvent<{}>) {
		if (event.detail.names.find((value) => value === TODO_CATEGORY_ORDER_DROP_ZONE)) {
			await handleUpdateCategoryOrder(event as DropEvent<TodoCategory>);
			return;
		} else {
			await handleTodoItemDropped(event as DropEvent<TodoItem>);
			return;
		}
	}

	async function handleUpdateCategoryOrder(event: DropEvent<TodoCategory>) {
		if (event.detail.data.id == category.id) {
			state = 'none';
			return;
		}

		const moveLeft = state == 'drop-zone-left-activated';

		state = 'calling-service';

		await callServiceInClient({
			serviceCall: async () => {
				await TodoCategoryClient({ token: $page.data.token }).updateOrderTodoCategory({
					id: event.detail.data.id,
					project_id: project.id,
					...generateNewOrderForTodoCategory(category, moveLeft, project)
				});
				todos.updateCategoriesSort(
					event.detail.data,
					generateNewOrderForTodoCategory(category, moveLeft, project)
				);
				state = 'none';
			},
			errorCallback: async (e) => {
				apiErrorTitle = e.message;
				state = 'none';
			}
		});
	}

	async function handleTodoItemDropped(event: DropEvent<TodoItem>) {
		if (
			category.items.find((todo) => event.detail.data.id == todo.id) ||
			event.detail.getCustomEventData(DROP_EVENT_HANDLED_BY_TODO_ITEM)
		) {
			state = 'none';
			return;
		}

		state = 'calling-service';
		await callServiceInClient({
			serviceCall: async () => {
				await TodoItemClient({ token: $page.data.token }).updateItemTodoItem({
					...event.detail.data,
					new_category_id: category.id
				});
				todos.removeTodo(event.detail.data);
				todos.addTodo({ ...event.detail.data, category_id: category.id, order: null });
				state = 'none';
			},
			errorCallback: async (e) => {
				apiErrorTitle = e.message;
				state = 'none';
			}
		});
	}

	function handleDragHover(event: CustomDragEvent) {
		if (event.detail.names.find((value) => value !== TODO_CATEGORY_ORDER_DROP_ZONE)) {
			return;
		}
		const position = cursorOnElementPositionX(event.detail.node, {
			x: event.detail.originalEvent.clientX,
			y: event.detail.originalEvent.clientY
		});

		state = position == 'right' ? 'drop-zone-right-activated' : 'drop-zone-left-activated';
	}

	function handleDragLeft() {
		state = 'none';
	}
</script>

<div
	use:dropzone={{
		model: {},
		names: [TODO_ITEM_NEW_CATEGORY_DROP_ZONE_NAME, TODO_CATEGORY_ORDER_DROP_ZONE],
		disabled: state === 'calling-service'
	}}
	use:draggable={{
		data: category,
		targetDropZoneNames: [TODO_CATEGORY_ORDER_DROP_ZONE],
		disabled: state === 'calling-service'
	}}
	on:dragHover={handleDragHover}
	on:dragLeft={handleDragLeft}
	on:dropped={handleOnDrop}
	class="relative flex max-h-full w-full rounded-xl border border-base-300"
>
	<Spinner visible={state === 'calling-service'}></Spinner>
	<DropZoneHelper
		visible={state === 'drop-zone-left-activated' || state === 'drop-zone-right-activated'}
		direction={state === 'drop-zone-right-activated' ? 'right' : 'left'}
	/>
	<div class="flex max-h-full w-full flex-col items-center overflow-y-auto p-5 {className}">
		<Alert class="mb-2" type="error" message={apiErrorTitle}></Alert>
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
				<span class="text-lg font-bold">{category.description}</span>
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
			{#each category.items as todo (todo.id)}
				<div
					class="w-full"
					in:receive={{ key: todo.id }}
					out:send={{ key: todo.id }}
					animate:flip={{ duration: 200 }}
				>
					<TodoItemComponent {todo} {category} />
				</div>
			{/each}
		{:else}
			<Empty class="mt-2 w-full justify-start" text="Add your first todo!" />
		{/if}
	</div>
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
