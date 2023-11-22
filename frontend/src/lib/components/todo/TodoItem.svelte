<script lang="ts">
	import { faCheckCircle, faTrashCan, faUndo } from '@fortawesome/free-solid-svg-icons';
	import todos from '$lib/stores/todos';
	import type { TodoItem } from '$lib/generated-client/models';
	import Alert from '$components/Alert.svelte';
	import Fa from 'svelte-fa';
	import { callServiceInClient } from '$lib/client-wrapper/wrapper.client';
	import { TodoItemClient } from '$lib/client-wrapper/clients';
	import { page } from '$app/stores';

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
</script>

<div class="card mt-4 bg-base-200 shadow-xl hover:bg-base-100">
	<div class="card-body">
		<Alert type="error" message={apiErrorTitle} />
		{#if isCallingService}
			<div
				class="align-center absolute left-0 top-0 z-10 flex h-full w-full justify-center rounded-lg bg-base-300"
			>
				<span class="loading loading-spinner loading-md dark:text-black" />
			</div>
		{/if}
		<div class="card-title flex w-full justify-between">
			<h1>
				{todo.title}
			</h1>
			<div>
				{#if todo.is_done}
					<button on:click={handleChangeDoneStatus}>
						<Fa icon={faUndo} class="text-red-400" />
					</button>
				{:else}
					<button on:click={handleChangeDoneStatus}>
						<Fa icon={faCheckCircle} class="text-green-400" />
					</button>
				{/if}
				<button on:click={handleRemoveTodo}>
					<Fa icon={faTrashCan} class="text-red-400" />
				</button>
			</div>
		</div>
		<p>{todo.description}</p>
	</div>
</div>
