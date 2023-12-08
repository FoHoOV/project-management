<script lang="ts">
	import TodoList from '$lib/components/todo/TodoList.svelte';
	import type { ActionData, PageData } from './$types';
	import todos from '$lib/stores/todos';
	import { flip } from 'svelte/animate';
	import CreateTodoItem from './CreateTodoItem.svelte';
	import CircleButton from '$components/buttons/CircleButton.svelte';
	import { faPlus } from '@fortawesome/free-solid-svg-icons';
	import CreateTodoCategory from './CreateTodoCategory.svelte';
	import Empty from '$components/Empty.svelte';
	import { page } from '$app/stores';
	import AttachToProject from '$routes/user/[project_name]-[project_id=integer]/todos/AttachToProject.svelte';
	import { onMount } from 'svelte';
	import EditTodoCategory from '$routes/user/[project_name]-[project_id=integer]/todos/EditTodoCategory.svelte';
	import EditTodoItem from '$routes/user/[project_name]-[project_id=integer]/todos/EditTodoItem.svelte';
	import MultiModal from '$components/popups/MultiModal.svelte';
	import type { TodoCategory, TodoItem } from '$lib/generated-client/models';

	export let data: PageData;
	export let form: ActionData;
	export let state: 'loading' | 'none' = 'loading';

	let modals: MultiModal;

	function handleCreateTodoCategory(e: MouseEvent) {
		modals.show('create-todo-category', {
			form: form,
			projectId: parseInt($page.params.projectId)
		});
	}

	function handleEditTodoCategory(e: CustomEvent<{ category: TodoCategory }>) {
		modals.show('edit-todo-category', { form: form, categoryId: e.detail.category.id });
	}

	function handleAttachToProject(e: CustomEvent<{ category: TodoCategory }>) {
		modals.show('attach-to-project', { form: form, categoryId: e.detail.category.id });
	}

	function handleEditTodoItem(e: CustomEvent<{ todo: TodoItem }>) {
		modals.show('edit-todo-item', {
			form: form,
			todoId: e.detail.todo.id,
			categoryId: e.detail.todo.category_id
		});
	}

	function handleCreateTodoItem(e: CustomEvent<{ category: TodoCategory }>) {
		modals.show('create-todo-item', { form: form, categoryId: e.detail.category.id });
	}

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
					<TodoList
						{category}
						projectId={Number.parseInt($page.params.project_id)}
						enabledFeatures={[
							'attach-to-project',
							'create-todo-item',
							'edit-todo-category',
							'edit-todo-item'
						]}
						on:createTodoItem={handleCreateTodoItem}
						on:editTodoItem={handleEditTodoItem}
						on:editTodoCategory={handleEditTodoCategory}
						on:attachToProject={handleAttachToProject}
					></TodoList>
				</div>
			{/each}
		{/if}
	</div>
	<CircleButton
		icon={faPlus}
		class="btn-primary fixed bottom-8 right-8 h-16 w-16"
		on:click={handleCreateTodoCategory}
	/>
{/if}

<MultiModal
	actions={[
		{ component: CreateTodoItem, name: 'create-todo-item', title: 'Create your todos here!' },
		{
			component: CreateTodoCategory,
			name: 'create-todo-category',
			title: 'Create todo categories here!'
		},
		{
			component: EditTodoCategory,
			name: 'edit-todo-category',
			title: 'Edit todo category details'
		},
		{ component: EditTodoItem, name: 'edit-todo-item', title: 'Edit todo item' },
		{ component: AttachToProject, name: 'attach-to-project', title: 'Attach to another project' }
	]}
	bind:this={modals}
></MultiModal>
