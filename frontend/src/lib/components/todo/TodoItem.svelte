<script lang="ts">
	import { faCheckCircle, faTrashCan, faUndo } from '@fortawesome/free-solid-svg-icons';
	import todos from '$lib/stores/todos';
	import type { Todo } from '$lib/client/models/Todo';
	import Error from '$components/Error.svelte';
	import Fa from 'svelte-fa/src/fa.svelte';
	import { callServiceInClient } from '$lib/client-wrapper/wrapper.client';
	import { TodoClient } from '../../client-wrapper/clients';
	import { page } from '$app/stores';

	export let todo: Todo;
	let isCallingService: boolean = false;
	let apiErrorTitle: string | null;

	async function handleChangeDoneStatus() {
		isCallingService = true;
		await callServiceInClient({
			serviceCall: async () => {
				await TodoClient({ token: $page.data.token }).update({
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
				await TodoClient({ token: $page.data.token }).remove(todo);
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

<div class="card-body">
	<Error message={apiErrorTitle} />
	{#if isCallingService}
		<div
			class="absolute flex align-center justify-center top-0.5 left-0.5 w-full h-full z-10 bg-base-300 rounded-lg"
		>
			<span class="loading loading-spinner loading-md dark:text-black" />
		</div>
	{/if}
	<div class="card-title flex justify-between w-full">
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
