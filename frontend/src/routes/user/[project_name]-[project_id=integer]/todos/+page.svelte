<script lang="ts">
	import TodoList from '$lib/components/todo/TodoList.svelte';
	import type { ActionData, PageData } from './$types';
	import todos from '$lib/stores/todos';
	import { flip } from 'svelte/animate';
	import CreateTodoItem from './CreateTodoItem.svelte';
	import CircleButton from '$components/buttons/CircleButton.svelte';
	import { faPlus } from '@fortawesome/free-solid-svg-icons';
	import Modal from '$components/popups/Modal.svelte';
	import CreateTodoCategory from './CreateTodoCategory.svelte';
	import Empty from '$components/Empty.svelte';
	import { page } from '$app/stores';
	import AttachToProject from '$routes/user/[project_name]-[project_id=integer]/todos/AttachToProject.svelte';
	import { onMount } from 'svelte';
	import EditTodoCategory from '$routes/user/[project_name]-[project_id=integer]/todos/EditTodoCategory.svelte';
	import EditTodoItem from '$routes/user/[project_name]-[project_id=integer]/todos/EditTodoItem.svelte';

	export let data: PageData;
	export let form: ActionData;
	export let state: 'loading' | 'none' = 'loading';

	let createTodoCategory: Modal;

	onMount(() => {
		if (!data.response) {
			state = 'none';
			return;
		}
		todos.setTodoCategories(data.response);
		state = 'none';
	});
</script>

<svelte:head>
	<title>todos</title>
</svelte:head>

{#if state === 'loading'}
	<span class="loading loading-ring m-auto block" />
{:else}
	<div class="flex h-full gap-5 overflow-auto">
		{#if $todos.length == 0}
			<Empty text="Create your first todo list!" />
		{:else}
			{#each $todos as category (category.id)}
				<div class="max-w-[27rem] shrink-0 basis-[27rem]" animate:flip={{ duration: 200 }}>
					<TodoList {category} projectId={Number.parseInt($page.params.project_id)}>
						<CreateTodoItem slot="create-todo-item" {form} categoryId={category.id} />
						<EditTodoCategory slot="edit-todo-category" {form} categoryId={category.id}
						></EditTodoCategory>
						<EditTodoItem
							slot="edit-todo-item"
							let:todo
							{form}
							categoryId={category.id}
							todoId={todo.id}
						></EditTodoItem>
						<AttachToProject slot="attach-to-project" {form} categoryId={category.id} />
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
{/if}
