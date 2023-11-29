<script lang="ts">
	import { faCheckCircle, faTrashCan, faUndo } from '@fortawesome/free-solid-svg-icons';
	import todos from '$lib/stores/todos';
	import type { TodoItem } from '$lib/generated-client/models';
	import Alert from '$components/Alert.svelte';
	import Fa from 'svelte-fa';
	import { callServiceInClient } from '$lib/client-wrapper/wrapper.client';
	import { TodoItemClient } from '$lib/client-wrapper/clients';
	import { page } from '$app/stores';
	import { draggable, dropzone, type DropEvent } from '$lib/actions';
	import {
		TODO_ITEM_NEW_CATEGORY_DROP_ZONE_NAME,
		TODO_ITEM_ORDER_DROP_ZONE
	} from '$components/todo/constants';
	import Spinner from '$components/Spinner.svelte';
	import TodoItemDropZone from '$components/todo/TodoItemDropZone.svelte';

	export let todo: TodoItem;
	let state: 'drop-zone-activated' | 'calling-service' | 'none' = 'none';
	let apiErrorTitle: string | null;

	async function handleChangeDoneStatus() {
		state = 'calling-service';
		await callServiceInClient({
			serviceCall: async () => {
				await TodoItemClient({ token: $page.data.token }).updateTodoItem({
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
			return;
		}

		state = 'calling-service';

		console.log(event.detail.names);

		await callServiceInClient({
			serviceCall: async () => {
				const newOrder = todo.order + 1;
				await TodoItemClient({ token: $page.data.token }).updateTodoItem({
					...todo,
					order: newOrder
				});
				todos.updateTodo({ ...event.detail.data, order: newOrder });
				console.log({ ...event.detail.data, order: newOrder });
				state = 'none';
			},
			errorCallback: async (e) => {
				apiErrorTitle = e.message;
				state = 'none';
			}
		});
	}
	function handleDragEnter() {
		state = 'drop-zone-activated';
	}

	function handleDragLeft() {
		state = 'none';
	}
</script>

<div
	class="card mt-4 !bg-base-200 shadow-xl hover:bg-base-100"
	use:dropzone={{ model: todo, names: [TODO_ITEM_ORDER_DROP_ZONE] }}
	use:draggable={{
		data: todo,
		targetDropZoneNames: [TODO_ITEM_NEW_CATEGORY_DROP_ZONE_NAME, TODO_ITEM_ORDER_DROP_ZONE]
	}}
	on:dropped={handleUpdateTodoItemOrder}
	on:dragEntered={handleDragEnter}
	on:dragLeft={handleDragLeft}
>
	<Spinner visible={state === 'calling-service'}></Spinner>
	<TodoItemDropZone visible={state === 'drop-zone-activated'} direction="top" />
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
