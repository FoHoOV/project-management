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

	export let todo: TodoItem;
	let isCallingService: boolean = false;
	let apiErrorTitle: string | null;

	async function handleChangeDoneStatus() {
		isCallingService = true;
		await callServiceInClient({
			serviceCall: async () => {
				await TodoItemClient({ token: $page.data.token }).updateTodoItem({
					...todo,
					is_done: !todo.is_done
				});
				todos.updateTodo(todo, !todo.is_done);
				isCallingService = false;
			},
			errorCallback: async (e) => {
				isCallingService = false;
				apiErrorTitle = e.message;
			}
		});
	}

	async function handleRemoveTodo() {
		isCallingService = true;
		await callServiceInClient({
			serviceCall: async () => {
				await TodoItemClient({ token: $page.data.token }).removeTodoItem(todo);
				todos.removeTodo(todo);
				isCallingService = false;
			},
			errorCallback: async (e) => {
				isCallingService = false;
				apiErrorTitle = e.message;
			}
		});
	}

	async function handleUpdateTodoItemOrder(event: DropEvent<TodoItem>) {}
</script>

<div
	class="card mt-4 !bg-base-200 shadow-xl hover:bg-base-100"
	use:dropzone={{ model: todo, name: TODO_ITEM_ORDER_DROP_ZONE }}
	use:draggable={{
		data: todo,
		targetDropZoneNames: [TODO_ITEM_NEW_CATEGORY_DROP_ZONE_NAME, TODO_ITEM_ORDER_DROP_ZONE]
	}}
	on:dropped={handleUpdateTodoItemOrder}
>
	<div class="card-body">
		<Alert type="error" message={apiErrorTitle} />
		<Spinner visible={isCallingService}></Spinner>

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
