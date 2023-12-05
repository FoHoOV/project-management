<script lang="ts">
	import { faCheckCircle, faTrashCan, faUndo } from '@fortawesome/free-solid-svg-icons';
	import todos from '$lib/stores/todos';
	import type { TodoItem } from '$lib/generated-client/models';
	import Alert from '$components/Alert.svelte';
	import Fa from 'svelte-fa';
	import { callServiceInClient } from '$lib/client-wrapper/wrapper.client';
	import { TodoItemClient } from '$lib/client-wrapper/clients';
	import { page } from '$app/stores';
	import { draggable, dropzone, type DropEvent, type CustomDragEvent } from '$lib/actions';
	import {
		DROP_EVENT_HANDLED_BY_TODO_ITEM,
		TODO_ITEM_NEW_CATEGORY_DROP_ZONE_NAME,
		TODO_ITEM_ORDER_DROP_ZONE
	} from '$components/todo/constants';
	import Spinner from '$components/Spinner.svelte';
	import DropZoneHelper from '$components/todo/DropZoneHelper.svelte';
	import { cursorOnElementPositionY } from '$lib/utils';
	import toasts from '$lib/stores/toasts';

	export let todo: TodoItem;
	let state: 'drop-zone-top-activated' | 'drop-zone-bottom-activated' | 'calling-service' | 'none' =
		'none';
	let apiErrorTitle: string | null;

	async function handleChangeDoneStatus() {
		state = 'calling-service';
		await callServiceInClient({
			serviceCall: async () => {
				await TodoItemClient({ token: $page.data.token }).updateItemTodoItem({
					...todo,
					is_done: !todo.is_done
				});
				todos.updateTodo({ ...todo, is_done: !todo.is_done });
				state = 'none';
			},
			errorCallback: async (e) => {
				apiErrorTitle = e.message;
				state = 'none';
			}
		});
	}

	async function handleRemoveTodo() {
		state = 'calling-service';
		await callServiceInClient({
			serviceCall: async () => {
				await TodoItemClient({ token: $page.data.token }).removeTodoItem(todo);
				todos.removeTodo(todo);
				state = 'none';
			},
			errorCallback: async (e) => {
				apiErrorTitle = e.message;
				state = 'none';
			}
		});
	}

	async function handleUpdateTodoItemOrder(event: DropEvent<TodoItem>) {
		if (event.detail.data.id == todo.id) {
			state = 'none';
			return;
		}

		if (event.detail.data.is_done !== todo.is_done) {
			state = 'none';
			toasts.addToast({
				message: 'todo status should be same for custom todo orders',
				time: 5000,
				type: 'error'
			});
			return;
		}

		const moveUp = state == 'drop-zone-top-activated';

		state = 'calling-service';
		event.detail.addCustomEventData(DROP_EVENT_HANDLED_BY_TODO_ITEM, true);
		await callServiceInClient({
			serviceCall: async () => {
				const updatingTodo = moveUp ? event.detail.data : todo;
				const nextId = moveUp ? todo.id : event.detail.data.id;
				await TodoItemClient({ token: $page.data.token }).updateOrderTodoItem({
					id: updatingTodo.id,
					moving_id: event.detail.data.id,
					new_category_id: todo.category_id,
					next_id: nextId
				});
				todos.updateTodoSort(
					{ ...updatingTodo, order: { next_id: nextId } },
					event.detail.data,
					todo.category_id
				);
				state = 'none';
			},
			errorCallback: async (e) => {
				apiErrorTitle = e.message;
				state = 'none';
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

		state = position == 'top' ? 'drop-zone-top-activated' : 'drop-zone-bottom-activated';
	}

	function handleDragLeft() {
		state = 'none';
	}
</script>

<div
	class="card mt-4 !bg-base-200 shadow-xl hover:bg-base-100"
	use:dropzone={{
		model: todo,
		names: [TODO_ITEM_ORDER_DROP_ZONE],
		disabled: state === 'calling-service'
	}}
	use:draggable={{
		data: todo,
		targetDropZoneNames: [TODO_ITEM_NEW_CATEGORY_DROP_ZONE_NAME, TODO_ITEM_ORDER_DROP_ZONE],
		disabled: state === 'calling-service'
	}}
	on:dropped={handleUpdateTodoItemOrder}
	on:dragHover={handleDragHover}
	on:dragLeft={handleDragLeft}
>
	<Spinner visible={state === 'calling-service'}></Spinner>
	<DropZoneHelper
		visible={state === 'drop-zone-top-activated' || state === 'drop-zone-bottom-activated'}
		direction={state === 'drop-zone-top-activated' ? 'top' : 'bottom'}
	/>
	<div class="card-body">
		<Alert type="error" message={apiErrorTitle} />

		<div class="card-title flex w-full justify-between">
			<h1>
				{todo.title}
			</h1>
			<div class="flex items-center justify-center gap-2">
				<input
					type="checkbox"
					class="checkbox"
					class:checkbox-success={todo.is_done}
					class:checkbox-error={!todo.is_done}
					checked={todo.is_done}
					on:click={handleChangeDoneStatus}
				/>
				<button on:click={handleRemoveTodo}>
					<Fa icon={faTrashCan} class="text-red-400" />
				</button>
			</div>
		</div>
		<p>{todo.description}</p>
	</div>
</div>
