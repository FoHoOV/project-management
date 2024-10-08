<script lang="ts" module>
	import AddTag from '$routes/user/[project_name]-[project_id=integer]/todos/AddTag.svelte';
	import EditTag from '$routes/user/[project_name]-[project_id=integer]/todos/EditTag.svelte';
	import AddTodoItemDependency from '$routes/user/[project_name]-[project_id=integer]/todos/AddTodoItemDependency.svelte';
	import EditTodoComment from '$routes/user/[project_name]-[project_id=integer]/todos/EditTodoComment.svelte';
	import CreateTodoComment from '$routes/user/[project_name]-[project_id=integer]/todos/CreateTodoComment.svelte';
	import EditTodoCategory from '$routes/user/[project_name]-[project_id=integer]/todos/EditTodoCategory.svelte';
	import EditTodoItem from '$routes/user/[project_name]-[project_id=integer]/todos/EditTodoItem.svelte';
	import AttachToProject from '$routes/user/[project_name]-[project_id=integer]/todos/AttachToProject.svelte';
	import CircleButton from '$components/buttons/CircleButton.svelte';
	import CreateTodoCategory from './CreateTodoCategory.svelte';
	import Empty from '$components/Empty.svelte';
	import TodoList from '$components/todos/todo-list/TodoList.svelte';
	import CreateTodoItem from './CreateTodoItem.svelte';
	import NavbarItem from '$components/navbar/NavbarItem.svelte';

	import type { SnippetParams as DrawerSnippetParams } from '$components/Drawer.svelte';

	import { flip } from 'svelte/animate';
	import { faGear, faPlus } from '@fortawesome/free-solid-svg-icons';
	import { page } from '$app/stores';
	import { onMount, untrack } from 'svelte';

	import type {
		TodoCategory,
		TodoCategoryPartialTodoItem,
		TodoItemPartialTag
	} from '$lib/generated-client/models';

	import type { TodoComment } from '$lib/generated-client/zod/schemas';

	import { TodoCategories, setTodoCategories } from '$lib/stores/todos';
	import { TodoComments } from '$lib/stores/todo-comments';
	import { generateTodoListSettingsUrl } from '$lib/utils/params/route';
	import { getMultiStepModal, getNavbar } from '$lib/stores';
</script>

<script lang="ts">
	const { data, form } = $props();

	let componentState = $state<'loading' | 'none'>('loading');

	const todoCategoriesStore = setTodoCategories(new TodoCategories(data.response ?? []));
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
	<NavbarItem
		href={generateTodoListSettingsUrl(data.currentProject.title, data.currentProject.id)}
		name=""
		icon={faGear}
	/>
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
					projectId={Number.parseInt($page.params.project_id)}
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
