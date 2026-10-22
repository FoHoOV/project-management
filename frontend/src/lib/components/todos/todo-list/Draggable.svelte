<script lang="ts" module>
	import DropZoneHelper from '#lib/components/todos/DropZoneHelper.svelte';
	import Spinner from '#lib/components/Spinner.svelte';

	import {
		TODO_ITEM_NEW_CATEGORY_DROP_ZONE_NAME,
		TODO_CATEGORY_ORDER_DROP_ZONE,
		DROP_EVENT_HANDLED_BY_TODO_ITEM
	} from '#lib/components/todos/constants.js';
	import {
		dropzone,
		draggable,
		type TodoCategory,
		ErrorCode,
		ErrorType,
		callService,
		cursorOnElementPositionX,
		type CustomDragEvent,
		type DropEvent,
		type TodoItem,
		type CommonComponentStates
	} from '#lib';
	import { generateNewOrderForTodoCategory } from '#lib/components/todos/utils.js';
	import { createApiClient } from '#lib/api-client.js';
	import { updateTodoCategories, updateTodoItems } from '#lib/generated-client/index.js';
	import type { Snippet } from 'svelte';
	import { getToastManager, getTodoCategories } from '#lib/stores/index.js';

	type ComponentState =
		CommonComponentStates | 'drop-zone-left-activated' | 'drop-zone-right-activated';

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
	const isCallingService = $derived(componentState === 'calling-service');

	async function handleOnDrop(event: DropEvent<object>) {
		if (event.names.find((value) => value === TODO_CATEGORY_ORDER_DROP_ZONE)) {
			await handleUpdateCategoryOrder(event as DropEvent<TodoCategory>);
			return;
		} else {
			await handleTodoItemDropped(event as DropEvent<TodoItem>);
			return;
		}
	}

	async function handleUpdateCategoryOrder(event: DropEvent<TodoCategory>) {
		if (event.data.id == category.id) {
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

		await callService({
			call: async () => {
				await updateTodoCategories({
					client: createApiClient(),
					path: { category_id: event.data.id },
					body: {
						order: {
							project_id: projectId,
							...generateNewOrderForTodoCategory(
								category,
								event.data,
								moveLeft,
								todoCategoriesStore.value$
							)
						}
					}
				});
				todoCategoriesStore?.updateCategoriesSort(
					event.data,
					generateNewOrderForTodoCategory(
						category,
						event.data,
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
			category.items.find((todo) => event.data.id == todo.id) ||
			event.getCustomEventData(DROP_EVENT_HANDLED_BY_TODO_ITEM)
		) {
			componentState = 'none';
			return;
		}

		componentState = 'calling-service';
		await callService({
			call: async () => {
				const result = await updateTodoItems({
					client: createApiClient(),
					path: { todo_id: event.data.id },
					body: {
						item: {
							new_category_id: category.id
						}
					}
				});
				todoCategoriesStore?.removeTodo(event.data, false);
				todoCategoriesStore?.addTodo(result);
				componentState = 'none';
			},
			errorHandler: async (e) => {
				componentState = 'none';
				if (e.type == ErrorType.API_ERROR && e.code == ErrorCode.DEPENDENCIES_NOT_RESOLVED) {
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
		if (event.names.find((value) => value !== TODO_CATEGORY_ORDER_DROP_ZONE)) {
			return;
		}
		const position = cursorOnElementPositionX(event.node, {
			x: event.originalEvent.clientX,
			y: event.originalEvent.clientY
		});

		componentState = position == 'right' ? 'drop-zone-right-activated' : 'drop-zone-left-activated';
	}

	function handleDragLeft() {
		componentState = 'none';
	}
</script>

<div
	{@attach dropzone({
		model: {},
		names: [TODO_ITEM_NEW_CATEGORY_DROP_ZONE_NAME, TODO_CATEGORY_ORDER_DROP_ZONE],
		disabled: isCallingService || disabled,
		onDropped: handleOnDrop,
		onDragHover: handleDragHover,
		onDragLeft: handleDragLeft
	})}
	{@attach draggable({
		data: category,
		targetDropZoneNames: [TODO_CATEGORY_ORDER_DROP_ZONE],
		disabled: isCallingService || disabled
	})}
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
