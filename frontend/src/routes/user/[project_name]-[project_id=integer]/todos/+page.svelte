<script lang="ts">
	import TodoList from '$lib/components/todo/TodoList.svelte';
	import todos from '$lib/stores/todos';
	import { flip } from 'svelte/animate';
	import CreateTodoItem from './CreateTodoItem.svelte';
	import CircleButton from '$components/buttons/CircleButton.svelte';
	import { faPlus } from '@fortawesome/free-solid-svg-icons';
	import CreateTodoCategory from './CreateTodoCategory.svelte';
	import Empty from '$components/Empty.svelte';
	import { page } from '$app/stores';
	import AttachToProject from '$routes/user/[project_name]-[project_id=integer]/todos/AttachToProject.svelte';
	import { onMount, untrack } from 'svelte';
	import EditTodoCategory from '$routes/user/[project_name]-[project_id=integer]/todos/EditTodoCategory.svelte';
	import EditTodoItem from '$routes/user/[project_name]-[project_id=integer]/todos/EditTodoItem.svelte';
	import type {
		TodoCategory,
		TodoCategoryPartialTodoItem,
		TodoItemPartialTag
	} from '$lib/generated-client/models';
	import EditTodoComment from '$routes/user/[project_name]-[project_id=integer]/todos/EditTodoComment.svelte';
	import CreateTodoComment from '$routes/user/[project_name]-[project_id=integer]/todos/CreateTodoComment.svelte';
	import type { TodoComment } from '$lib/generated-client/zod/schemas';
	import AddTag from '$routes/user/[project_name]-[project_id=integer]/todos/AddTag.svelte';
	import EditTag from '$routes/user/[project_name]-[project_id=integer]/todos/EditTag.svelte';
	import AddTodoItemDependency from '$routes/user/[project_name]-[project_id=integer]/todos/AddTodoItemDependency.svelte';
	import multiModal from '$lib/stores/multi-modal';

	const { data, form } = $props();

	let componentState = $state<'loading' | 'none'>('loading');

	$effect(() => {
		data;
		untrack(() => {
			if (data.response) {
				todos.setTodoCategories(data.response);
			}
		});
	});

	function handleCreateTodoCategory(e: MouseEvent) {
		multiModal.add({
			component: CreateTodoCategory,
			props: () => {
				return {
					form: form
				};
			},
			title: 'Create todo categories'
		});
	}

	function handleEditTodoCategory(e: CustomEvent<{ category: TodoCategory }>) {
		multiModal.add({
			component: EditTodoCategory,
			props: () => {
				return {
					form: form,
					category: e.detail.category
				};
			},
			title: "Edit this todo category's details"
		});
	}

	function handleAttachToProject(e: CustomEvent<{ category: TodoCategory }>) {
		multiModal.add({
			component: AttachToProject,
			props: () => {
				return {
					form: form,
					categoryId: e.detail.category.id
				};
			},
			title: 'Attach this todo category to another project'
		});
	}

	function handleEditTodoItem(e: CustomEvent<{ todo: TodoCategoryPartialTodoItem }>) {
		multiModal.add({
			component: EditTodoItem,
			props: () => {
				return {
					form: form,
					todo: e.detail.todo
				};
			},
			title: "Edit this todo item's details"
		});
	}

	function handleCreateTodoItem(e: CustomEvent<{ category: TodoCategory }>) {
		multiModal.add({
			component: CreateTodoItem,
			props: () => {
				return {
					form: form,
					categoryId: e.detail.category.id
				};
			},
			title: 'Create a new todo item'
		});
	}

	function handleCreateComment(e: CustomEvent<{ todoId: number }>) {
		multiModal.add({
			component: CreateTodoComment,
			props: () => {
				return {
					form: form,
					todoId: e.detail.todoId
				};
			},
			title: 'Add a comment to the selected todo item'
		});
	}

	function handleEditTodoComment(e: CustomEvent<{ comment: TodoComment }>) {
		multiModal.add({
			component: EditTodoComment,
			props: () => {
				return {
					form: form,
					comment: e.detail.comment
				};
			},
			title: 'Edit comments'
		});
	}

	function handleAddTag(e: CustomEvent<{ todo: TodoCategoryPartialTodoItem }>) {
		multiModal.add({
			component: AddTag,
			props: () => {
				return {
					form: form,
					todoId: e.detail.todo.id
				};
			},
			title: 'Add tags to this todo item'
		});
	}

	function handleEditTag(e: CustomEvent<{ tag: TodoItemPartialTag }>) {
		multiModal.add({
			component: EditTag,
			props: () => {
				return {
					form: form,
					tag: e.detail.tag
				};
			},
			title: "Edit this tag's details"
		});
	}

	function handleAddTodoItemDependency(e: CustomEvent<{ todo: TodoCategoryPartialTodoItem }>) {
		multiModal.add({
			component: AddTodoItemDependency,
			props: () => {
				return {
					form: form,
					todo: e.detail.todo
				};
			},
			title:
				'Add todo dependencies here, this todo cannot be marked as done unless all of its dependencies are marked as done'
		});
	}

	onMount(() => {
		componentState = 'none';
	});
</script>

<svelte:head>
	<title>todos</title>
</svelte:head>

{#if componentState === 'loading'}
	<span class="loading loading-ring m-auto block" />
{:else}
	<div class="flex h-full gap-5 overflow-auto">
		{#if todos.length == 0}
			<Empty text="Create your first todo list!" />
		{:else}
			{#each todos.categories as category (category.id)}
				<div
					class="max-w-[27rem] shrink-0 basis-[20rem] xs:basis-[26rem] md:max-w-[28rem] md:basis-[28rem]"
					animate:flip={{ duration: 200 }}
				>
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
							'update-todo-item-order',
							'add-dependency',
							'sort-on-update-status'
						]}
						on:createTodoItem={handleCreateTodoItem}
						on:editTodoItem={handleEditTodoItem}
						on:editTodoCategory={handleEditTodoCategory}
						on:attachToProject={handleAttachToProject}
						on:editComment={handleEditTodoComment}
						on:createComment={handleCreateComment}
						on:addTag={handleAddTag}
						on:editTag={handleEditTag}
						on:addDependency={handleAddTodoItemDependency}
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
