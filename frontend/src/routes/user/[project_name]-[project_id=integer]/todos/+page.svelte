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
	import { onMount, type ComponentProps } from 'svelte';
	import EditTodoCategory from '$routes/user/[project_name]-[project_id=integer]/todos/EditTodoCategory.svelte';
	import EditTodoItem from '$routes/user/[project_name]-[project_id=integer]/todos/EditTodoItem.svelte';
	import MultiModal from '$components/popups/MultiModal.svelte';
	import type { TodoCategory, TodoItem, TodoItemPartialTag } from '$lib/generated-client/models';
	import EditTodoComment from '$routes/user/[project_name]-[project_id=integer]/todos/EditTodoComment.svelte';
	import CreateTodoComment from '$routes/user/[project_name]-[project_id=integer]/todos/CreateTodoComment.svelte';
	import type { TodoComment } from '$lib/generated-client/zod/schemas';
	import AddTag from '$routes/user/[project_name]-[project_id=integer]/todos/AddTag.svelte';
	import EditTag from '$routes/user/[project_name]-[project_id=integer]/todos/EditTag.svelte';

	export let data: PageData;
	export let form: ActionData;
	export let state: 'loading' | 'none' = 'loading';

	let actions = [
		{ component: CreateTodoItem, name: 'create-todo-item', title: 'Create your todos here!' },
		{
			component: CreateTodoComment,
			name: 'create-todo-comment',
			title: 'Create todo comments here!'
		},
		{ component: EditTodoComment, name: 'edit-todo-comment', title: 'Edit comment' },
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
		{ component: AttachToProject, name: 'attach-to-project', title: 'Attach to another project' },
		{ component: AddTag, name: 'add-tag', title: 'Add a new tag to this todo item' },
		{ component: EditTag, name: 'edit-tag', title: "Edit this tag's name" }
	] as const;

	let selectedActionProps: ComponentProps<any> | null = null;

	let modals: MultiModal<typeof actions>;

	$: selectedActionProps = { ...selectedActionProps, form };

	function handleCreateTodoCategory(e: MouseEvent) {
		selectedActionProps = {
			projectId: parseInt($page.params.projectId)
		};
		modals.show('create-todo-category');
	}

	function handleEditTodoCategory(e: CustomEvent<{ category: TodoCategory }>) {
		selectedActionProps = { category: e.detail.category };
		modals.show('edit-todo-category');
	}

	function handleAttachToProject(e: CustomEvent<{ category: TodoCategory }>) {
		selectedActionProps = { categoryId: e.detail.category.id };
		modals.show('attach-to-project');
	}

	function handleEditTodoItem(e: CustomEvent<{ todo: TodoItem }>) {
		selectedActionProps = { todo: e.detail.todo };
		modals.show('edit-todo-item');
	}

	function handleCreateTodoItem(e: CustomEvent<{ category: TodoCategory }>) {
		selectedActionProps = { categoryId: e.detail.category.id };
		modals.show('create-todo-item');
	}

	function handleCreateComment(e: CustomEvent<{ todoId: number }>) {
		selectedActionProps = { todoId: e.detail.todoId };
		modals.show('create-todo-comment');
	}

	function handleEditTodoComment(e: CustomEvent<{ comment: TodoComment }>) {
		selectedActionProps = { comment: e.detail.comment };
		modals.show('edit-todo-comment');
	}

	function handleAddTag(e: CustomEvent<{ todo: TodoItem }>) {
		selectedActionProps = { todoId: e.detail.todo.id };
		modals.show('add-tag');
	}

	function handleEditTag(e: CustomEvent<{ tag: TodoItemPartialTag }>) {
		selectedActionProps = { tag: e.detail.tag };
		modals.show('edit-tag');
	}

	onMount(() => {
		if (!data.response) {
			state = 'none';
			throw new window.Error("couldn't load todo categories from server");
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
							'edit-todo-item',
							'create-comment',
							'edit-comment',
							'add-tag',
							'edit-tag',
							'update-todo-item-order'
						]}
						on:createTodoItem={handleCreateTodoItem}
						on:editTodoItem={handleEditTodoItem}
						on:editTodoCategory={handleEditTodoCategory}
						on:attachToProject={handleAttachToProject}
						on:editComment={handleEditTodoComment}
						on:createComment={handleCreateComment}
						on:addTag={handleAddTag}
						on:editTag={handleEditTag}
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
	bind:this={modals}
	class="border border-success border-opacity-20"
	{actions}
	{selectedActionProps}
></MultiModal>
