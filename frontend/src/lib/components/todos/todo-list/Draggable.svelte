<script lang="ts" context="module">
	import DropZoneHelper from '$components/todos/DropZoneHelper.svelte';
	import Spinner from '$components/Spinner.svelte';

	import { page } from '$app/stores';
	import {
		TODO_ITEM_NEW_CATEGORY_DROP_ZONE_NAME,
		TODO_CATEGORY_ORDER_DROP_ZONE,
		DROP_EVENT_HANDLED_BY_TODO_ITEM
	} from '$components/todos/constants';
	import {
		dropzone,
		draggable,
		type TodoCategory,
		ErrorCode,
		ErrorType,
		callServiceInClient,
		cursorOnElementPositionX,
		type CustomDragEvent,
		type DropEvent,
		type TodoItem,
		type CommonComponentStates
	} from '$lib';
	import { generateNewOrderForTodoCategory } from '$components/todos/utils';
	import { TodoCategoryClient, TodoItemClient } from '$lib/client-wrapper/clients';
	import type { Snippet } from 'svelte';
	import { getToastManager, getTodoCategories } from '$lib/stores';

	type ComponentState =
		| CommonComponentStates
		| 'drop-zone-left-activated'
		| 'drop-zone-right-activated';

	export type Events = {
		onError?: (message: string) => void;
	};

	export type Props = {
		category: TodoCategory;
		projectId: number;
		disabled: boolean;
		children: Snippet;
	} & Events;
</script>

<script lang="ts">
	const { category, projectId, disabled, onError, children }: Props = $props();

	const todoCategoriesStore = getTodoCategories();
	const toastsMangerStore = getToastManager();
	let componentState = $state<ComponentState>('none');

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
			componentState = 'none';
			return;
		}

		if (!todoCategoriesStore) {
			throw new Error(
				'todoCategories store must have value for UpdateCategoryOrder service to workS'
			);
		}

		const moveLeft = componentState == 'drop-zone-left-activated';
		componentState = 'calling-service';

		await callServiceInClient({
			call: async () => {
				await TodoCategoryClient({ token: $page.data.token }).updateOrderTodoCategory({
					id: event.detail.data.id,
					project_id: projectId,
					...generateNewOrderForTodoCategory(
						category,
						event.detail.data,
						moveLeft,
						todoCategoriesStore.value$
					)
				});
				todoCategoriesStore?.updateCategoriesSort(
					event.detail.data,
					generateNewOrderForTodoCategory(
						category,
						event.detail.data,
						moveLeft,
						todoCategoriesStore.value$
					)
				);
				componentState = 'none';
			},
			errorHandler: async (e) => {
				onError?.(e.message);
				componentState = 'none';
			}
		});
	}

	async function handleTodoItemDropped(event: DropEvent<TodoItem>) {
		if (
			category.items.find((todo) => event.detail.data.id == todo.id) ||
			event.detail.getCustomEventData(DROP_EVENT_HANDLED_BY_TODO_ITEM)
		) {
			componentState = 'none';
			return;
		}

		componentState = 'calling-service';
		await callServiceInClient({
			call: async () => {
				const result = await TodoItemClient({ token: $page.data.token }).updateItemTodoItem({
					id: event.detail.data.id,
					category_id: event.detail.data.category_id,
					new_category_id: category.id
				});
				todoCategoriesStore?.removeTodo(event.detail.data, false);
				todoCategoriesStore?.addTodo(result);
				componentState = 'none';
			},
			errorHandler: async (e) => {
				componentState = 'none';
				if (e.type == ErrorType.API_ERROR && e.code == ErrorCode.DependenciesNotResolved) {
					toastsMangerStore.addToast({
						type: 'error',
						message: e.message,
						time: 6000
					});
					return;
				}
				onError?.(e.message);
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

		componentState = position == 'right' ? 'drop-zone-right-activated' : 'drop-zone-left-activated';
	}

	function handleDragLeft() {
		componentState = 'none';
	}
</script>

<div
	use:dropzone={{
		model: {},
		names: [TODO_ITEM_NEW_CATEGORY_DROP_ZONE_NAME, TODO_CATEGORY_ORDER_DROP_ZONE],
		disabled: componentState === 'calling-service' || disabled
	}}
	use:draggable={{
		data: category,
		targetDropZoneNames: [TODO_CATEGORY_ORDER_DROP_ZONE],
		disabled: componentState === 'calling-service' || disabled
	}}
	ondragHover={handleDragHover}
	ondragLeft={handleDragLeft}
	ondropped={handleOnDrop}
	class="relative h-full"
>
	<Spinner visible={componentState === 'calling-service'}></Spinner>
	<DropZoneHelper
		visible={componentState === 'drop-zone-left-activated' ||
			componentState === 'drop-zone-right-activated'}
		direction={componentState === 'drop-zone-right-activated' ? 'right' : 'left'}
	/>
	{@render children()}
</div>
