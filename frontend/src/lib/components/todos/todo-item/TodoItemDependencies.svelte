<script lang="ts" context="module">
	import Spinner from '$components/Spinner.svelte';
	import Alert from '$components/Alert.svelte';
	import Confirm from '$components/Confirm.svelte';

	import { page } from '$app/stores';
	import { TodoItemClient } from '$lib/client-wrapper/clients';
	import { callServiceInClient } from '$lib/client-wrapper/wrapper.client';
	import Fa from 'svelte-fa';
	import { faPlus, faPlusCircle, faTrashCan } from '@fortawesome/free-solid-svg-icons';
	import { flip } from 'svelte/animate';
	import type {
		TodoCategoryPartialTodoItem,
		TodoItemPartialDependency
	} from '$lib/generated-client';
	import type { CommonComponentStates } from '$lib';
	import { getTodosStoreFromContext } from '$components/todos/utils';

	export type Events = {
		onAddDependency?: (todo: TodoCategoryPartialTodoItem) => void;
	};

	export type Props = {
		todo: TodoCategoryPartialTodoItem;
	} & Events;
</script>

<script script lang="ts">
	const { todo, onAddDependency } = $props<Props>();

	let componentState = $state<CommonComponentStates>('none');
	let apiErrorTitle = $state<string | null>(null);
	let deleteDependencyConfirms = $state<Confirm[]>([]);

	const todoCategoriesStore = getTodosStoreFromContext();

	async function handleDeleteDependency(dependency: TodoItemPartialDependency) {
		componentState = 'calling-service';
		await callServiceInClient({
			call: async () => {
				await TodoItemClient({ token: $page.data.token }).removeTodoItemDependencyTodoItem({
					dependency_id: dependency.id
				});
				todoCategoriesStore?.removeDependency(todo.id, dependency);
				componentState = 'none';
				apiErrorTitle = null;
			},
			onError: async (e) => {
				apiErrorTitle = e.message;
				componentState = 'none';
			}
		});
	}

	function handleCreateDependency() {
		onAddDependency?.(todo);
	}
</script>

<div class="relative flex flex-col">
	<Spinner visible={componentState === 'calling-service'}></Spinner>
	<Alert type="error" message={apiErrorTitle} class="mb-2" />
	<button
		on:click={handleCreateDependency}
		class="btn btn-square btn-success w-full"
		class:hidden={!onAddDependency}
	>
		<Fa icon={faPlus} />
		<p>add dependency</p>
	</button>
	{#if todo.dependencies.length == 0}
		<div class="my-5 flex flex-row items-center gap-2">
			{#if !onAddDependency}
				no dependencies
			{:else}
				<Fa icon={faPlusCircle} />
				<p class="break-words text-lg">add dependencies using the plus sign above</p>
			{/if}
		</div>
	{:else}
		{#each todo.dependencies as dependency, i (dependency.id)}
			<div
				class="card relative mt-4 max-h-44 overflow-y-auto !bg-base-200 shadow-xl hover:bg-base-100"
				animate:flip={{ duration: 200 }}
				data-testid="todo-dependency-wrapper"
			>
				<Confirm
					bind:this={deleteDependencyConfirms[i]}
					onConfirmed={() => handleDeleteDependency?.(dependency)}
				></Confirm>

				<div class="card-body flex-row-reverse justify-between">
					<button
						class="btn btn-square btn-error btn-sm"
						on:click={() => deleteDependencyConfirms[i].show()}
						data-testid="todo-dependency-delete"
					>
						<Fa icon={faTrashCan}></Fa>
					</button>
					<p class="flex items-center gap-1 truncate whitespace-pre-wrap break-words">
						<span class="text-lg font-bold text-info" data-testid="todo-dependency-text">
							#{dependency.dependant_todo_id}
						</span>
						{dependency.dependant_todo_title}
					</p>
				</div>
			</div>
		{/each}
	{/if}
</div>
