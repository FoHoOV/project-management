<script lang="ts" context="module">
	import Spinner from '$components/Spinner.svelte';
	import DropZoneHelper from '$components/todos/DropZoneHelper.svelte';

	import { page } from '$app/stores';
	import {
		TODO_ITEM_ORDER_DROP_ZONE,
		TODO_ITEM_NEW_CATEGORY_DROP_ZONE_NAME,
		DROP_EVENT_HANDLED_BY_TODO_ITEM
	} from '$components/todos/constants';
	import { generateNewOrderForTodoItem } from '$components/todos/utils';
	import {
		dropzone,
		draggable,
		type StrictUnion,
		type TodoCategoryPartialTodoItem,
		type TodoItem,
		type CommonComponentStates,
		ErrorCode,
		ErrorType,
		callServiceInClient,
		cursorOnElementPositionY,
		type CustomDragEvent,
		type DropEvent,
		type TodoCategory
	} from '$lib';
	import { TodoItemClient } from '$lib/client-wrapper/clients';
	import type { Snippet } from 'svelte';
	import { getToastManager, getTodoCategories } from '$lib/stores';

	type ComponentStates =
		| CommonComponentStates
		| 'drop-zone-top-activated'
		| 'drop-zone-bottom-activated';

	export type Events = {
		onError?: (message: string) => void;
	};

	export type Props = {
		todo: StrictUnion<TodoItem | TodoCategoryPartialTodoItem>;
		disabled: boolean;
		category?: TodoCategory;
		children: Snippet;
	} & Events;
</script>

<script lang="ts">
	const { todo, disabled, category, onError, children }: Props = $props();

	let componentState = $state<ComponentStates>();

	const todoCategoriesStore = getTodoCategories();
	const toastManagerStore = getToastManager();

	async function handleUpdateTodoItemOrder(event: DropEvent<TodoCategoryPartialTodoItem>) {
		if (event.detail.data.id == todo.id) {
			componentState = 'none';
			return;
		}

		if (!category) {
			throw new Error('what?');
		}

		const cachedCategory = category;
		const moveUp = componentState == 'drop-zone-top-activated';

		componentState = 'calling-service';
		event.detail.addCustomEventData(DROP_EVENT_HANDLED_BY_TODO_ITEM, true);

		await callServiceInClient({
			call: async () => {
				const result = await TodoItemClient({ token: $page.data.token }).updateOrderTodoItem({
					id: event.detail.data.id,
					new_category_id: todo.category_id,
					...generateNewOrderForTodoItem(todo, event.detail.data, moveUp, cachedCategory)
				});
				todoCategoriesStore?.updateTodoSort(
					event.detail.data,
					todo.category_id,
					generateNewOrderForTodoItem(todo, event.detail.data, moveUp, cachedCategory)
				);
				todoCategoriesStore?.updateTodo(result);
				componentState = 'none';
			},
			errorHandler: async (e) => {
				componentState = 'none';

				if (e.type == ErrorType.API_ERROR) {
					toastManagerStore.addToast({
						type: 'error',
						message: e.message,
						time: 6000
					});
					if (e.code == ErrorCode.DependenciesNotResolved) {
						todo.is_done = false;
					}
					return;
				}

				onError?.(e.message);
			}
		});

		if (event.detail.data.category_id != todo.category_id) {
			// we stopPropagation cause if the category ids are not the same we've already updated the category_id for this element
			event.detail.originalEvent.stopPropagation();
			event.detail.originalEvent.preventDefault();
		}
	}

	function handleDragHover(event: CustomDragEvent) {
		const position = cursorOnElementPositionY(event.detail.node, {
			x: event.detail.originalEvent.clientX,
			y: event.detail.originalEvent.clientY
		});

		componentState = position == 'top' ? 'drop-zone-top-activated' : 'drop-zone-bottom-activated';
	}

	function handleDragLeft() {
		componentState = 'none';
	}

	$effect(() => {
		if (!disabled && !category) {
			throw new Error(
				'If you want the todo-item to be able to update its order please provide the TodoCategory associated with it'
			);
		}
	});
</script>

<div
	class="relative mt-4"
	use:dropzone={{
		model: todo,
		names: [TODO_ITEM_ORDER_DROP_ZONE],
		disabled: componentState === 'calling-service'
	}}
	use:draggable={{
		data: todo,
		targetDropZoneNames: [TODO_ITEM_NEW_CATEGORY_DROP_ZONE_NAME, TODO_ITEM_ORDER_DROP_ZONE],
		disabled: componentState === 'calling-service' || disabled
	}}
	ondropped={handleUpdateTodoItemOrder}
	ondragHover={handleDragHover}
	ondragLeft={handleDragLeft}
>
	<Spinner visible={componentState === 'calling-service'}></Spinner>
	<DropZoneHelper
		visible={componentState === 'drop-zone-top-activated' ||
			componentState === 'drop-zone-bottom-activated'}
		direction={componentState === 'drop-zone-top-activated' ? 'top' : 'bottom'}
	/>
	{@render children()}
</div>
