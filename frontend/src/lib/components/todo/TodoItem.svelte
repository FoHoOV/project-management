<script lang="ts" context="module">
	import type { Feature as TodoCommentFeature } from './TodoComments.svelte';
	import type { Feature as TodoTagFeature } from './TodoTags.svelte';
	import type { Feature as TodoDependencyFeature } from './TodoItemDependencies.svelte';
	export type Feature =
		| TodoCommentFeature
		| TodoTagFeature
		| TodoDependencyFeature
		| 'edit-todo-item'
		| 'update-todo-item-order';
</script>

<script lang="ts">
	import {
		faCalendarCheck,
		faComment,
		faEdit,
		faSitemap,
		faTags,
		faTrashCan
	} from '@fortawesome/free-solid-svg-icons';
	import todos from '$lib/stores/todos';
	import { ErrorCode, type TodoCategory, type TodoItem } from '$lib/generated-client/models';
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
	import { cursorOnElementPositionY } from '$lib/utils';
	import { generateNewOrderForTodoItem as generateNewOrderForMovingTodoItem } from '$components/todo/utils';
	import { createEventDispatcher } from 'svelte';
	import TodoComments from './TodoComments.svelte';
	import Modal from '$components/popups/Modal.svelte';
	import TodoTags from './TodoTags.svelte';
	import { ErrorType } from '$lib/client-wrapper/wrapper.universal';
	import toasts from '$lib/stores/toasts/toasts';
	import TodoItemDependencies from './TodoItemDependencies.svelte';
	import Confirm from '$components/Confirm.svelte';

	export let todo: TodoItem;
	export let category: TodoCategory | null = null;
	export let enabledFeatures: Feature[] | null = null;

	$: enabledTodoCommentFeatures = (enabledFeatures?.filter(
		(feature) => feature == 'edit-comment' || feature == 'create-comment'
	) ?? null) as TodoCommentFeature[] | null;

	$: {
		if (enabledFeatures?.includes('update-todo-item-order') && !category) {
			throw new Error(
				'If you want the todo-item to be able to update its order please provide the TodoCategory associated with it'
			);
		}
	}

	$: enabledTodoTagFeatures = (enabledFeatures?.filter(
		(feature) => feature == 'edit-tag' || feature == 'add-tag'
	) ?? null) as TodoTagFeature[] | null;

	$: enabledTodoDependencyFeatures = (enabledFeatures?.filter(
		(feature) => feature == 'add-dependency'
	) ?? null) as TodoDependencyFeature[] | null;

	let state:
		| 'drop-zone-top-activated'
		| 'drop-zone-bottom-activated'
		| 'calling-service'
		| 'showing-todo-comments'
		| 'showing-todo-tags'
		| 'showing-todo-dependencies'
		| 'none' = 'none';
	let apiErrorTitle: string | null;
	let todoComments: TodoComments;
	let todoCommentsModal: Modal;
	let todoTagsModal: Modal;
	let todoDependenciesModal: Modal;
	let confirmDeleteTodo: Confirm;

	const dispatch = createEventDispatcher<{
		editTodoItem: { todo: TodoItem };
	}>();

	async function handleChangeDoneStatus() {
		state = 'calling-service';
		const savedTodoStatus = todo.is_done;
		await callServiceInClient({
			serviceCall: async () => {
				const result = await TodoItemClient({ token: $page.data.token }).updateItemTodoItem({
					...todo,
					is_done: !savedTodoStatus
				});
				todos.updateTodo({ ...result });
				if (result.is_done == savedTodoStatus) {
					toasts.addToast({
						type: 'warning',
						time: 9000,
						message: 'This category has a rule that prevents this item being marked as `UNDONE`'
					});
				}
				state = 'none';
				apiErrorTitle = null;
			},
			errorCallback: async (e) => {
				if (
					e.type == ErrorType.API_ERROR &&
					(e.code == ErrorCode.DependenciesNotResolved || e.code == ErrorCode.TodoNotFound)
				) {
					toasts.addToast({
						type: 'error',
						message: e.message,
						time: 6000
					});
					todo.is_done = false;
				} else {
					apiErrorTitle = e.message;
					todo.is_done = savedTodoStatus;
				}
				state = 'none';
			}
		});
	}

	async function handleRemoveTodo() {
		state = 'calling-service';
		await callServiceInClient({
			serviceCall: async () => {
				await TodoItemClient({ token: $page.data.token }).removeTodoItem(todo);
				todos.removeTodo(todo);
				state = 'none';
				apiErrorTitle = null;
			},
			errorCallback: async (e) => {
				apiErrorTitle = e.message;
				state = 'none';
			}
		});
	}

	async function handleUpdateTodoItemOrder(event: DropEvent<TodoItem>) {
		if (event.detail.data.id == todo.id) {
			state = 'none';
			return;
		}

		if (category === null) {
			throw new Error('what?');
		}

		const cachedCategory = category;

		const moveUp = state == 'drop-zone-top-activated';

		state = 'calling-service';
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
				state = 'none';
				apiErrorTitle = null;
			},
			errorCallback: async (e) => {
				if (e.type == ErrorType.API_ERROR && e.code == ErrorCode.DependenciesNotResolved) {
					toasts.addToast({
						type: 'error',
						message: e.message,
						time: 6000
					});
					todo.is_done = false;
				} else {
					apiErrorTitle = e.message;
				}
				state = 'none';
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

		state = position == 'top' ? 'drop-zone-top-activated' : 'drop-zone-bottom-activated';
	}

	function handleDragLeft() {
		state = 'none';
	}

	function handleEditTodoItem() {
		dispatch('editTodoItem', { todo: todo });
	}

	function handleShowComments() {
		todoComments.refreshComments();
		todoCommentsModal.show();
	}

	function handleShowTags() {
		todoTagsModal.show();
	}

	function handleShowDependencies() {
		todoDependenciesModal.show();
	}
</script>

<div
	class="card mt-4 max-h-full bg-base-200 shadow-xl transition-colors hover:bg-base-300"
	use:dropzone={{
		model: todo,
		names: [TODO_ITEM_ORDER_DROP_ZONE],
		disabled: state === 'calling-service'
	}}
	use:draggable={{
		data: todo,
		targetDropZoneNames: [TODO_ITEM_NEW_CATEGORY_DROP_ZONE_NAME, TODO_ITEM_ORDER_DROP_ZONE],
		disabled: state === 'calling-service' || !enabledFeatures?.includes('update-todo-item-order')
	}}
	on:dropped={handleUpdateTodoItemOrder}
	on:dragHover={handleDragHover}
	on:dragLeft={handleDragLeft}
>
	<Spinner visible={state === 'calling-service'}></Spinner>
	<DropZoneHelper
		visible={state === 'drop-zone-top-activated' || state === 'drop-zone-bottom-activated'}
		direction={state === 'drop-zone-top-activated' ? 'top' : 'bottom'}
	/>
	<Confirm bind:this={confirmDeleteTodo} on:onConfirm={handleRemoveTodo}></Confirm>
	<div class="card-body pb-4">
		<Alert type="error" message={apiErrorTitle} />

		<div class="card-title flex w-full justify-between">
			<div class="flex w-full gap-2">
				<div class="tooltip" data-tip="todo id">
					<span class="text-lg font-bold text-info">#{todo.id}</span>
				</div>
				<h1 class="block max-w-full truncate hover:text-clip">{todo.title}</h1>
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
				<button on:click={() => confirmDeleteTodo.show()}>
					<Fa icon={faTrashCan} class="text-red-400" />
				</button>
			</div>
		</div>

		<p class="truncate hover:text-clip">{todo.description}</p>

		<div class="flex items-center gap-2 py-2">
			<Fa icon={faCalendarCheck} class="text-warning"></Fa>
			{#if todo.due_date}
				<span>{todo.due_date.toLocaleDateString()}</span>
			{:else}
				<span>-</span>
			{/if}
		</div>

		<div class="flex gap-2 self-end">
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

<Modal
	class="cursor-default border border-success border-opacity-20"
	wrapperClasses={state != 'showing-todo-dependencies' ? 'hidden' : ''}
	title="Manage your dependencies here"
	bind:this={todoDependenciesModal}
	dialogProps={{
		//@ts-ignore
		//TODO: another ugly hack which will be solved by svelte5
		ondragstart: 'event.preventDefault();event.stopPropagation();',
		draggable: true
	}}
	on:opened={() => (state = 'showing-todo-dependencies')}
	on:closed={() => (state = 'none')}
>
	<TodoItemDependencies
		slot="body"
		{todo}
		enabledFeatures={enabledTodoDependencyFeatures}
		on:addDependency
	></TodoItemDependencies>
</Modal>

<Modal
	class="cursor-default border border-success border-opacity-20"
	wrapperClasses={state != 'showing-todo-tags' ? 'hidden' : ''}
	title="Manage your tags here"
	bind:this={todoTagsModal}
	dialogProps={{
		//@ts-ignore
		//TODO: another ugly hack which will be solved by svelte5
		ondragstart: 'event.preventDefault();event.stopPropagation();',
		draggable: true
	}}
	on:opened={() => (state = 'showing-todo-tags')}
	on:closed={() => (state = 'none')}
>
	<TodoTags slot="body" {todo} enabledFeatures={enabledTodoTagFeatures} on:addTag on:editTag
	></TodoTags>
</Modal>

<Modal
	class="cursor-default border border-success border-opacity-20"
	wrapperClasses={state != 'showing-todo-comments' ? 'hidden' : ''}
	title="Manage your todo comments here"
	bind:this={todoCommentsModal}
	dialogProps={{
		//@ts-ignore
		//TODO: another ugly hack which will be solved by svelte5
		ondragstart: 'event.preventDefault();event.stopPropagation();',
		draggable: true
	}}
	on:opened={() => (state = 'showing-todo-comments')}
	on:closed={() => (state = 'none')}
>
	<TodoComments
		bind:this={todoComments}
		slot="body"
		todoId={todo.id}
		enabledFeatures={enabledTodoCommentFeatures}
		on:createComment
		on:editComment
	></TodoComments>
</Modal>
