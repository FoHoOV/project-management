<script lang="ts" context="module">
	import type {
		Feature as TodoCommentFeature,
		DispatcherEventTypes as TodoCommentsDispatcherEventTypes
	} from './TodoComments.svelte';
	import type {
		Feature as TodoTagFeature,
		DispatcherEventTypes as TodoTagsDispatcherEventTypes
	} from './TodoTags.svelte';
	import type {
		Feature as TodoDependencyFeature,
		DispatcherEventTypes as TodoItemDependenciesDispatcherEventTypes
	} from './TodoItemDependencies.svelte';

	export type Feature =
		| TodoCommentFeature
		| TodoTagFeature
		| TodoDependencyFeature
		| 'edit-todo-item'
		| 'update-todo-item-order'
		| 'show-project-id'
		| 'show-category-title'
		| 'sort-on-update-status';

	export type DispatcherEventTypes = {
		editTodoItem: { todo: TodoCategoryPartialTodoItem };
	} & TodoCommentsDispatcherEventTypes &
		TodoTagsDispatcherEventTypes &
		TodoItemDependenciesDispatcherEventTypes;

	export type Props = {
		todo: StrictUnion<TodoItem | TodoCategoryPartialTodoItem>;
		category?: TodoCategory | null;
		enabledFeatures?: Feature[] | null;
	};
</script>

<script lang="ts">
	import {
		faCalendarCheck,
		faComment,
		faEdit,
		faSitemap,
		faTags,
		faTrashCan,
		faUser
	} from '@fortawesome/free-solid-svg-icons';
	import todos from '$lib/stores/todos';
	import {
		ErrorCode,
		type TodoCategory,
		type TodoCategoryPartialTodoItem,
		type TodoItem
	} from '$lib/generated-client/models';
	import Alert from '$components/Alert.svelte';
	import Fa from 'svelte-fa';
	import { callServiceInClient } from '$lib/client-wrapper/wrapper.client';
	import { TodoItemClient } from '$lib/client-wrapper/clients';
	import { page } from '$app/stores';
	import { draggable, dropzone, type DropEvent, type CustomDragEvent } from '$lib/actions';
	import {
		DROP_EVENT_HANDLED_BY_TODO_ITEM,
		TODO_ITEM_NEW_CATEGORY_DROP_ZONE_NAME,
		TODO_ITEM_ORDER_DROP_ZONE
	} from '$components/todo/constants';
	import Spinner from '$components/Spinner.svelte';
	import DropZoneHelper from '$components/todo/DropZoneHelper.svelte';
	import { cursorOnElementPositionY, type StrictUnion } from '$lib/utils';
	import { generateNewOrderForTodoItem as generateNewOrderForMovingTodoItem } from '$components/todo/utils';
	import { createEventDispatcher } from 'svelte';
	import TodoComments, { type Props as TodoCommentsProps } from './TodoComments.svelte';
	import TodoTags, { type Props as TodoTagsProps } from './TodoTags.svelte';
	import { ErrorType } from '$lib/client-wrapper/wrapper.universal';
	import toasts from '$lib/stores/toasts/toasts';
	import TodoItemDependencies, {
		type Props as TodoDependenciesProps
	} from './TodoItemDependencies.svelte';
	import Confirm from '$components/Confirm.svelte';
	import multiModal from '$lib/stores/multi-modal';

	const { todo, category = null, enabledFeatures = null, ...restProps } = $props<Props>();

	let componentState = $state<
		'drop-zone-top-activated' | 'drop-zone-bottom-activated' | 'calling-service' | 'none'
	>('none');
	let apiErrorTitle = $state<string | null>(null);
	let confirmDeleteTodo = $state<Confirm | null>(null);

	const dispatch = createEventDispatcher<DispatcherEventTypes>();

	$effect(() => {
		if (enabledFeatures?.includes('update-todo-item-order') && !category) {
			throw new Error(
				'If you want the todo-item to be able to update its order please provide the TodoCategory associated with it'
			);
		}
	});

	async function handleChangeDoneStatus() {
		componentState = 'calling-service';
		const savedTodoStatus = todo.is_done;
		await callServiceInClient({
			serviceCall: async () => {
				const result = await TodoItemClient({ token: $page.data.token }).updateItemTodoItem({
					...todo,
					is_done: !savedTodoStatus
				});
				todos.updateTodo(result, !enabledFeatures?.includes('sort-on-update-status'));
				if (result.is_done == savedTodoStatus) {
					toasts.addToast({
						type: 'warning',
						time: 9000,
						message: 'This category has a rule that prevents this item being marked as `UNDONE`'
					});
				}
				componentState = 'none';
				apiErrorTitle = null;
			},
			errorCallback: async (e) => {
				if (e.type == ErrorType.API_ERROR) {
					toasts.addToast({
						type: 'error',
						message: e.message,
						time: 6000
					});
				} else {
					apiErrorTitle = e.message;
				}
				todo.is_done = savedTodoStatus;
				componentState = 'none';
			}
		});
	}

	async function handleRemoveTodo() {
		componentState = 'calling-service';
		await callServiceInClient({
			serviceCall: async () => {
				await TodoItemClient({ token: $page.data.token }).removeTodoItem(todo);
				todos.removeTodo(todo);
				componentState = 'none';
				apiErrorTitle = null;
			},
			errorCallback: async (e) => {
				apiErrorTitle = e.message;
				componentState = 'none';
			}
		});
	}

	async function handleUpdateTodoItemOrder(event: DropEvent<TodoCategoryPartialTodoItem>) {
		if (event.detail.data.id == todo.id) {
			componentState = 'none';
			return;
		}

		if (category === null) {
			throw new Error('what?');
		}

		const cachedCategory = category;

		const moveUp = componentState == 'drop-zone-top-activated';

		componentState = 'calling-service';
		event.detail.addCustomEventData(DROP_EVENT_HANDLED_BY_TODO_ITEM, true);
		await callServiceInClient({
			serviceCall: async () => {
				const result = await TodoItemClient({ token: $page.data.token }).updateOrderTodoItem({
					id: event.detail.data.id,
					new_category_id: todo.category_id,
					...generateNewOrderForMovingTodoItem(todo, event.detail.data, moveUp, cachedCategory)
				});
				todos.updateTodoSort(
					event.detail.data,
					todo.category_id,
					generateNewOrderForMovingTodoItem(todo, event.detail.data, moveUp, cachedCategory)
				);
				todos.updateTodo(result);
				componentState = 'none';
				apiErrorTitle = null;
			},
			errorCallback: async (e) => {
				if (e.type == ErrorType.API_ERROR) {
					toasts.addToast({
						type: 'error',
						message: e.message,
						time: 6000
					});
					if (e.code == ErrorCode.DependenciesNotResolved) {
						todo.is_done = false;
					}
				} else {
					apiErrorTitle = e.message;
				}
				componentState = 'none';
			}
		});

		if (event.detail.data.category_id != todo.category_id) {
			// we stopPropagation cause if the category ids are not the same we've already updated the category_id for this element
			event.detail.originalEvent.stopPropagation();
			event.detail.originalEvent.preventDefault();
		}
	}

	function handleDragHover(event: CustomDragEvent) {
		const position = cursorOnElementPositionY(event.detail.node, {
			x: event.detail.originalEvent.clientX,
			y: event.detail.originalEvent.clientY
		});

		componentState = position == 'top' ? 'drop-zone-top-activated' : 'drop-zone-bottom-activated';
	}

	function handleDragLeft() {
		componentState = 'none';
	}

	function handleEditTodoItem() {
		dispatch('editTodoItem', { todo: todo });
	}

	function handleShowComments() {
		multiModal.add({
			component: TodoComments,
			props: () => {
				return {
					todoId: todo.id,
					enabledFeatures: enabledFeatures as TodoCommentFeature[] | null,
					onCreateComment: (e) => {
						dispatch('createComment', e);
					},
					onEditComment: (e) => {
						dispatch('editComment', e);
					}
				} satisfies TodoCommentsProps;
			},
			title: 'Manage todo comments here'
		});
	}

	function handleShowTags() {
		multiModal.add({
			component: TodoTags,
			props: () => {
				return {
					todo: todo,
					enabledFeatures: enabledFeatures as TodoTagFeature[] | null,
					onAddTag: (e) => {
						dispatch('addTag', e);
					},
					onEditTag: (e) => {
						dispatch('editTag', e);
					}
				} satisfies TodoTagsProps;
			},
			title: 'Manage your todo tags here'
		});
	}

	function handleShowDependencies() {
		multiModal.add({
			component: TodoItemDependencies,
			props: () => {
				return {
					todo: todo,
					enabledFeatures: enabledFeatures as TodoDependencyFeature[] | null,
					onAddDependency: (e) => {
						dispatch('addDependency', e);
					}
				} satisfies TodoDependenciesProps;
			},
			title: 'Manage your dependencies here'
		});
	}

	function _getDueDateClass(date: Date | null) {
		if (!date || todo.is_done) {
			return '';
		}

		const dueDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

		if (Date.now() > dueDate.getTime()) {
			return 'text-error';
		} else if (dueDate.getTime() - Date.now() < 1 * 24 * 60 * 60 * 1000) {
			return 'text-warning';
		} else {
			return 'text-success';
		}
	}
</script>

<div
	class="card mt-4 max-h-full bg-base-200 shadow-xl transition-colors hover:bg-base-300"
	use:dropzone={{
		model: todo,
		names: [TODO_ITEM_ORDER_DROP_ZONE],
		disabled: componentState === 'calling-service'
	}}
	use:draggable={{
		data: todo,
		targetDropZoneNames: [TODO_ITEM_NEW_CATEGORY_DROP_ZONE_NAME, TODO_ITEM_ORDER_DROP_ZONE],
		disabled:
			componentState === 'calling-service' || !enabledFeatures?.includes('update-todo-item-order')
	}}
	on:dropped={handleUpdateTodoItemOrder}
	on:dragHover={handleDragHover}
	on:dragLeft={handleDragLeft}
>
	<Spinner visible={componentState === 'calling-service'}></Spinner>
	<DropZoneHelper
		visible={componentState === 'drop-zone-top-activated' ||
			componentState === 'drop-zone-bottom-activated'}
		direction={componentState === 'drop-zone-top-activated' ? 'top' : 'bottom'}
	/>
	<Confirm bind:this={confirmDeleteTodo} on:onConfirm={handleRemoveTodo}></Confirm>
	<div class="card-body pb-4">
		<Alert type="error" message={apiErrorTitle} />

		<div class="card-title flex w-full justify-between">
			<div class="flex w-full items-baseline gap-2">
				<div class="tooltip tooltip-info" data-tip="todo id">
					<span class="text-lg font-bold text-info">#{todo.id}</span>
				</div>
				<h1 class="break-words-legacy block max-w-full whitespace-normal break-words">
					{todo.title}
				</h1>
			</div>
			<div class="flex items-center justify-center gap-2">
				<input
					type="checkbox"
					class="checkbox"
					class:checkbox-success={todo.is_done}
					class:checkbox-error={!todo.is_done}
					bind:checked={todo.is_done}
					on:click={handleChangeDoneStatus}
				/>
				<button
					on:click={handleEditTodoItem}
					class:hidden={!enabledFeatures?.includes('edit-todo-item')}
				>
					<Fa icon={faEdit} class="text-success" />
				</button>
				<button on:click={() => confirmDeleteTodo?.show()}>
					<Fa icon={faTrashCan} class="text-red-400" />
				</button>
			</div>
		</div>

		<p class="break-words-legacy whitespace-normal break-words">{todo.description}</p>

		<div class="flex items-center gap-2 py-2">
			<Fa icon={faCalendarCheck} class={_getDueDateClass(todo.due_date)}></Fa>
			{#if todo.due_date}
				<span class={_getDueDateClass(todo.due_date)}>{todo.due_date.toLocaleDateString()}</span>
			{:else}
				<span>-</span>
			{/if}
		</div>

		{#if enabledFeatures?.includes('show-project-id')}
			<div>
				<span>in projects: </span>
				{#each todo.category?.projects || [] as project}
					<div class="inline-flex flex-row items-center gap-1 overflow-y-auto px-1">
						(
						<span class="text-lg font-bold text-info">#{project.id}</span>
						-
						<span class="max-w-full font-bold text-info">{project.title}</span>
						)
					</div>
				{/each}
			</div>
		{/if}

		{#if enabledFeatures?.includes('show-category-title')}
			<div class="flex flex-row items-center gap-2 overflow-y-auto">
				<span>in category: </span>
				<span class="text-lg font-bold text-info">#{todo.category?.id}</span>
				<span class="whitespace-normal font-bold text-info">{todo.category?.title}</span>
			</div>
		{/if}

		{#if todo.marked_as_done_by}
			<div class="flex items-center gap-2 self-end">
				<span>Completed by: </span>
				<div class="flex flex-row items-center gap-1.5">
					<span class="block rounded-full border border-dashed border-warning p-1.5">
						<Fa icon={faUser} />
					</span>

					<span class="text font-semibold text-success">{todo.marked_as_done_by?.username}</span>
				</div>
			</div>
		{/if}

		<div class="flex gap-2 self-end py-1">
			<div class="indicator self-end">
				<span class="badge indicator-item badge-secondary">{todo.comments_count}</span>
				<button class="btn btn-info btn-outline btn-sm" on:click={handleShowComments}>
					<Fa icon={faComment}></Fa>
					<span>comments</span>
				</button>
			</div>

			<div class="indicator self-end">
				<span class="badge indicator-item badge-secondary">{todo.tags.length}</span>
				<button class="btn btn-info btn-outline btn-sm" on:click={handleShowTags}>
					<Fa icon={faTags}></Fa>
					<span>tags</span>
				</button>
			</div>
		</div>

		<div class="flex gap-2 self-end">
			<div class="indicator col-start-2 self-end">
				<span class="badge indicator-item badge-secondary">{todo.dependencies.length}</span>
				<button class="btn btn-info btn-outline btn-sm" on:click={handleShowDependencies}>
					<Fa icon={faSitemap}></Fa>
					<span>dependencies</span>
				</button>
			</div>
		</div>
	</div>
</div>
