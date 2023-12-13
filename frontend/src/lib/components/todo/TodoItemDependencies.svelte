<script lang="ts" context="module">
	export type Feature = 'add-dependency';
</script>

<script script lang="ts">
	import { page } from '$app/stores';
	import Spinner from '$components/Spinner.svelte';
	import Alert from '$components/Alert.svelte';
	import { TodoItemClient } from '$lib/client-wrapper/clients';
	import { callServiceInClient } from '$lib/client-wrapper/wrapper.client';
	import Fa from 'svelte-fa';
	import { faPlus, faPlusCircle, faTrashCan } from '@fortawesome/free-solid-svg-icons';
	import { createEventDispatcher } from 'svelte';
	import { flip } from 'svelte/animate';
	import type { TodoItem, TodoItemPartialDependency } from '$lib/generated-client';
	import todos from '$lib/stores/todos/todos';

	export let todo: TodoItem;
	export let enabledFeatures: Feature[] | null = null;

	let state: 'calling-service' | 'none' = 'none';
	let apiErrorTitle: string | null = null;

	const dispatch = createEventDispatcher<{
		addDependency: { todo: TodoItem };
	}>();

	async function handleDeleteDependency(dependency: TodoItemPartialDependency) {
		state = 'calling-service';
		await callServiceInClient({
			serviceCall: async () => {
				await TodoItemClient({ token: $page.data.token }).removeTodoItemDependencyTodoItem({
					dependency_id: dependency.id
				});
				todos.removeDependency(todo.id, dependency);
				state = 'none';
			},
			errorCallback: async (e) => {
				apiErrorTitle = e.message;
				state = 'none';
			}
		});
	}

	function handleCreateDependency() {
		dispatch('addDependency', { todo: todo });
	}
</script>

<div class="relative flex flex-col">
	<Spinner visible={state === 'calling-service'}></Spinner>
	<Alert type="error" message={apiErrorTitle} class="mb-2" />
	<button
		on:click={handleCreateDependency}
		class="btn btn-square btn-success w-full"
		class:hidden={!enabledFeatures?.includes('add-dependency')}
	>
		<Fa icon={faPlus} />
		<p>add dependency</p>
	</button>
	{#if todo.dependencies.length == 0}
		<div
			class="my-5 flex flex-row items-center gap-2"
			class:hidden={!enabledFeatures?.includes('add-dependency')}
		>
			<Fa icon={faPlusCircle} />
			<p class="break-words text-lg">add dependencies using the plus sign above</p>
		</div>
	{:else}
		{#each todo.dependencies as dependency (dependency.id)}
			<div
				class="card mt-4 max-h-44 overflow-y-auto !bg-base-200 shadow-xl hover:bg-base-100"
				animate:flip={{ duration: 200 }}
			>
				<div class="card-body flex-row-reverse justify-between">
					<button
						class="btn btn-square btn-error btn-sm"
						on:click={() => handleDeleteDependency(dependency)}
					>
						<Fa icon={faTrashCan}></Fa>
					</button>
					<p class="whitespace-pre-wrap break-words font-bold">
						#{dependency.dependant_todo_id}
					</p>
				</div>
			</div>
		{/each}
	{/if}
</div>
