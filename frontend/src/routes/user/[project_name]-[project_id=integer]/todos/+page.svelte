<script lang="ts" module>
	import AddTag from './AddTag.svelte';
	import EditTag from './EditTag.svelte';
	import AddTodoItemDependency from './AddTodoItemDependency.svelte';
	import EditTodoComment from './EditTodoComment.svelte';
	import CreateTodoComment from './CreateTodoComment.svelte';
	import EditTodoCategory from './EditTodoCategory.svelte';
	import EditTodoItem from './EditTodoItem.svelte';
	import AttachToProject from './AttachToProject.svelte';
	import CircleButton from '#lib/components/buttons/CircleButton.svelte';
	import CreateTodoCategory from './CreateTodoCategory.svelte';
	import Empty from '#lib/components/Empty.svelte';
	import TodoList from '#lib/components/todos/todo-list/TodoList.svelte';
	import CreateTodoItem from './CreateTodoItem.svelte';
	import NavbarItem from '#lib/components/navbar/NavbarItem.svelte';

	import type { SnippetParams as DrawerSnippetParams } from '#lib/components/Drawer.svelte';

	import { flip } from 'svelte/animate';
	import { faGear, faPlus } from '@fortawesome/free-solid-svg-icons';
	import { page } from '$app/state';
	import { onMount, untrack } from 'svelte';

	import type {
		TodoCategory,
		TodoCategoryPartialTodoItem,
		TodoItemPartialTag
	} from '#lib/generated-client/index.js';

	import type { TodoComment } from '#lib/generated-client/index.js';

	import { TodoCategories, setTodoCategories } from '#lib/stores/todos/index.js';
	import { TodoComments } from '#lib/stores/todo-comments/index.js';
	import { generateTodoListSettingsUrl } from '#lib/utils/params/route.js';
	import type { PageProps } from './$types';
	import { getMultiStepModal, getNavbar } from '#lib/stores/index.js';
</script>

<script lang="ts">
	const { data, form, params }: PageProps = $props();

	let componentState = $state<'loading' | 'none'>('loading');

	const todoCategoriesStore = setTodoCategories(
		new TodoCategories(untrack(() => data.response) ?? [])
	);
	const multiStepModalStore = getMultiStepModal();
	const navbarStore = getNavbar();

	navbarStore.add('end', settings);

	$effect.pre(() => {
		data;
		untrack(() => {
			if (data.response) {
				todoCategoriesStore.setCategories(data.response);
			}
		});
	});

	function handleCreateTodoCategory(e: MouseEvent) {
		multiStepModalStore.add({
			component: CreateTodoCategory,
			props: () => {
				return {
					params,
					form: form
				};
			},
			title: 'Create todo categories'
		});
	}

	function handleEditTodoCategory(category: TodoCategory) {
		multiStepModalStore.add({
			component: EditTodoCategory,
			props: () => {
				return {
					params,
					form: form,
					category: category
				};
			},
			title: "Edit this todo category's details"
		});
	}

	function handleAttachToProject(category: TodoCategory) {
		multiStepModalStore.add({
			component: AttachToProject,
			props: () => {
				return {
					params,
					form: form,
					categoryId: category.id
				};
			},
			title: 'Attach this todo category to another project'
		});
	}

	function handleEditTodoItem(todo: TodoCategoryPartialTodoItem) {
		multiStepModalStore.add({
			component: EditTodoItem,
			props: () => {
				return {
					params,
					form: form,
					todo: todo
				};
			},
			title: "Edit this todo item's details"
		});
	}

	function handleCreateTodoItem(category: TodoCategory) {
		multiStepModalStore.add({
			component: CreateTodoItem,
			props: () => {
				return {
					params,
					form: form,
					categoryId: category.id
				};
			},
			title: 'Create a new todo item'
		});
	}

	function handleCreateComment(todoId: number, store: TodoComments) {
		multiStepModalStore.add({
			component: CreateTodoComment,
			props: () => {
				return {
					params,
					form: form,
					todoCommentsStore: store,
					todoId: todoId
				};
			},
			title: 'Add a comment to the selected todo item'
		});
	}

	function handleEditTodoComment(comment: TodoComment, store: TodoComments) {
		multiStepModalStore.add({
			component: EditTodoComment,
			props: () => {
				return {
					params,
					form: form,
					todoCommentsStore: store,
					comment: comment
				};
			},
			title: 'Edit comments'
		});
	}

	function handleAddTag(todo: TodoCategoryPartialTodoItem) {
		multiStepModalStore.add({
			component: AddTag,
			props: () => {
				return {
					params,
					form: form,
					todoId: todo.id
				};
			},
			title: 'Add tags to this todo item'
		});
	}

	function handleEditTag(tag: TodoItemPartialTag) {
		multiStepModalStore.add({
			component: EditTag,
			props: () => {
				return {
					params,
					form: form,
					tag: tag
				};
			},
			title: "Edit this tag's details"
		});
	}

	function handleAddTodoItemDependency(todo: TodoCategoryPartialTodoItem) {
		multiStepModalStore.add({
			component: AddTodoItemDependency,
			props: () => {
				return {
					params,
					form: form,
					todo: todo
				};
			},
			title:
				'Add todo dependencies here, this todo cannot be marked as done unless all of its dependencies are marked as done'
		});
	}

	onMount(() => {
		componentState = 'none';
		return () => {
			navbarStore.remove('end', settings);
		};
	});
</script>

<svelte:head>
	<title>todos</title>
</svelte:head>

{#snippet settings({ closeDrawer }: DrawerSnippetParams[0])}
	<NavbarItem href={generateTodoListSettingsUrl(params)} name="" icon={faGear} />
{/snippet}

{#if componentState === 'loading'}
	<span class="loading loading-ring m-auto block"></span>
{:else}
	<div class="flex h-full gap-5 overflow-auto">
		{#each todoCategoriesStore.value$ as category (category.id)}
			<div
				class="mb-3 max-w-[27rem] shrink-0 basis-[20rem] xs:basis-[26rem] md:max-w-[28rem] md:basis-[28rem]"
				animate:flip={{ duration: 200 }}
			>
				<TodoList
					{category}
					projectId={Number.parseInt(page.params.project_id!)}
					onCreateTodoItem={handleCreateTodoItem}
					onEditTodoItem={handleEditTodoItem}
					onEditTodoCategory={handleEditTodoCategory}
					onAttachToProject={handleAttachToProject}
					onEditComment={handleEditTodoComment}
					onCreateComment={handleCreateComment}
					onAddTag={handleAddTag}
					onEditTag={handleEditTag}
					onAddDependency={handleAddTodoItemDependency}
				></TodoList>
			</div>
		{:else}
			<Empty text="Create your first todo list!" />
		{/each}
	</div>
	<CircleButton
		icon={faPlus}
		class="btn-primary fixed bottom-8 right-8 h-16 w-16"
		onclick={handleCreateTodoCategory}
	/>
{/if}
