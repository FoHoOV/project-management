<script lang="ts">
	import TodoList from '$lib/components/todo/TodoList.svelte';
	import Error from '$components/Error.svelte';
	import type { ActionData, PageData } from './$types';
	import todoCategories from '$lib/stores/todos';
	import { flip } from 'svelte/animate';
	import CreateTodoItem from './CreateTodoItem.svelte';
	import CircleButton from '$components/buttons/CircleButton.svelte';
	import { faCross, faPlus } from '@fortawesome/free-solid-svg-icons';
	import Modal from '$components/popups/Modal.svelte';
	import CreateTodoCategory from '$routes/user/todos/CreateTodoCategory.svelte';
	import Empty from '$components/Empty.svelte';

	export let data: PageData;
	export let form: ActionData;

	let createTodoCategory: Modal;

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
	<div class="flex h-full gap-5 overflow-auto">
		{#if $todoCategories.length == 0}
			<Empty text="Create your first todo list!" />
		{:else}
			{#each $todoCategories as category (category.id)}
				<div
					class="mb-5 shrink-0 grow basis-[20rem] md:basis-[25rem]"
					animate:flip={{ duration: 200 }}
				>
					<TodoList {category}>
						<CreateTodoItem slot="create-todo-item" {form} categoryId={category.id} />
					</TodoList>
				</div>
			{/each}
		{/if}
	</div>
	<CircleButton
		icon={faPlus}
		class="btn-primary fixed bottom-8 right-8 h-16 w-16"
		on:click={createTodoCategory.show}
	/>
	<Modal title="Create todo categories here!" bind:this={createTodoCategory}>
		<svelte:fragment slot="body" let:close let:show>
			<CreateTodoCategory {form} />
		</svelte:fragment>
	</Modal>
{:catch error}
	<Error message={error.message} />
{/await}
