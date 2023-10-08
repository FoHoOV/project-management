<script lang="ts">
	import TodoList from '$lib/components/todo/TodoList.svelte';
	import Error from '$components/Error.svelte';
	import type { ActionData, PageData } from './$types';
	import todoCategories from '$lib/stores/todos';
	import { flip } from 'svelte/animate';
	import CreateTodoItem from './CreateTodoItem.svelte';
	import CircleButton from '$components/buttons/CircleButton.svelte';
	import { faCross, faPlus } from '@fortawesome/free-solid-svg-icons';

	export let data: PageData;
	export let form: ActionData;

	async function resolveTodoCategories() {
		const fetchedTodos = await data.streamed.todos;
		if (fetchedTodos.success) {
			todoCategories.setTodoCategories(fetchedTodos.result);
		} else {
			Promise.reject(fetchedTodos.error.body.message);
		}
	}
</script>

<svelte:head>
	<title>todos</title>
</svelte:head>

<!-- stream the data from load function !-->
{#await resolveTodoCategories()}
	<span class="loading loading-ring m-auto block" />
{:then}
	<div class="flex gap-5 overflow-auto min-h-16">
		{#each $todoCategories as category (category.id)}
			<div class="min-w-[20rem] mb-20 grow" animate:flip={{ duration: 200 }}>
				<TodoList {category}>
					<svelte:fragment slot="create-todo-item">
						<CreateTodoItem {form} categoryId={category.id} />
					</svelte:fragment>
				</TodoList>
			</div>
		{/each}
	</div>
	<CircleButton icon={faPlus} class="w-16 h-16 btn-primary fixed bottom-8 right-8" />
{:catch error}
	<Error message={error.message} />
{/await}
