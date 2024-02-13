<script lang="ts" context="module">
	import Confirm from '$components/Confirm.svelte';
	import Draggable from './Draggable.svelte';
	import Spinner from '$components/Spinner.svelte';
	import Alert from '$components/Alert.svelte';
	import TodoItem from '../todo-item/TodoItem.svelte';
	import Empty from '$components/Empty.svelte';
	import TodoListActions from './TodoListActions.svelte';

	import { page } from '$app/stores';
	import { callServiceInClient, receive, send, type CommonComponentStates } from '$lib';
	import { TodoCategoryClient } from '$lib/client-wrapper/clients';
	import type { TodoCategory } from '$lib/generated-client';
	import { todoCategories } from '$lib/stores/todos';
	import type { Events as TodoItemEvents } from '../todo-item/TodoItem.svelte';
	import {
		faInfoCircle,
		faEdit,
		faRuler,
		faTrashCan,
		faArrowCircleRight,
		faCirclePlus,
		faPaperclip
	} from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import { flip } from 'svelte/animate';
	import { multiStepModal } from '$lib/stores/multi-step-modal';

	export type Events = {
		onEditTodoCategory?: (category: TodoCategory) => void;
		onCreateTodoItem?: (category: TodoCategory) => void;
		onAttachToProject?: (category: TodoCategory) => void;
	} & TodoItemEvents;

	export type Props = {
		category: TodoCategory;
		projectId: number;
		draggable?: boolean;
		class?: string;
	} & Events;
</script>

<script lang="ts">
	const { category, projectId, draggable = true, class: className, ...restProps } = $props<Props>();
	let componentState = $state<CommonComponentStates>('none');
	let apiErrorTitle = $state<string | null>(null);
	let confirmDeleteTodoCategory = $state<Confirm | null>();

	async function handleDeleteCategory() {
		componentState = 'calling-service';
		await callServiceInClient({
			serviceCall: async () => {
				await TodoCategoryClient({ token: $page.data.token }).detachFromProjectTodoCategory({
					category_id: category.id,
					project_id: projectId
				});
				todoCategories.removeCategory(category);
				componentState = 'none';
				apiErrorTitle = null;
			},
			errorCallback: async (e) => {
				apiErrorTitle = e.message;
				componentState = 'none';
			}
		});
	}

	function handleShowManageActions(
		event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
	) {
		multiStepModal.add({
			component: TodoListActions,
			props: () => {
				return { category: category };
			},
			title: 'Enable/Disable rules for this todo category here'
		});
	}
</script>

<Draggable
	{category}
	{projectId}
	disabled={!draggable}
	onError={(error) => (apiErrorTitle = error)}
>
	<div
		class="relative flex max-h-full w-full rounded-xl border border-opacity-70 shadow-lg transition-colors hover:border-opacity-100 dark:border-opacity-30 dark:hover:border-opacity-50"
		class:border-dashed={category.projects.length > 1}
		class:border-warning={category.projects.length > 1}
		class:border-info={category.projects.length <= 1}
	>
		<Spinner visible={componentState === 'calling-service'}></Spinner>
		<Confirm bind:this={confirmDeleteTodoCategory} onConfirmed={handleDeleteCategory}></Confirm>
		<div class="flex max-h-full w-full flex-col items-center overflow-y-auto p-5 {className}">
			<Alert class="mb-2" type="error" message={apiErrorTitle}></Alert>
			<div class="flex w-full max-w-full flex-col self-start">
				<div class="flex w-full justify-between">
					<div class="flex max-w-full items-baseline">
						<Fa icon={faInfoCircle} class="mx-2 inline" />
						<div
							class="tooltip tooltip-bottom tooltip-info pr-2 text-lg font-bold"
							data-tip="category id"
						>
							<span class="text-info">#{category.id}</span>
						</div>
						<span
							class="break-words-legacy block max-w-full whitespace-normal break-words text-lg font-bold"
						>
							{category.title}
						</span>
					</div>
					<div class="flex gap-2">
						<button
							on:click={() => restProps.onEditTodoCategory?.(category)}
							class="text-xl"
							class:hidden={!restProps.onEditTodoCategory}
						>
							<Fa icon={faEdit} class="text-success" />
						</button>
						<button class="text-xl" on:click={handleShowManageActions}>
							<Fa icon={faRuler} class="text-info" />
						</button>
						<button class="text-xl" on:click={() => confirmDeleteTodoCategory?.show()}>
							<Fa icon={faTrashCan} class="text-red-400" />
						</button>
					</div>
				</div>
				<div class="flex max-w-full items-baseline">
					<Fa icon={faArrowCircleRight} class="mx-2 inline" />
					<span
						class="break-words-legacy block max-w-full whitespace-normal break-words text-lg font-bold"
					>
						{category.description}
					</span>
				</div>
			</div>
			<div class="mt-2 flex w-full gap-2">
				<button
					class="btn btn-success flex-1"
					class:hidden={!restProps.onCreateTodoItem}
					on:click={() => restProps.onCreateTodoItem?.(category)}
				>
					<Fa icon={faCirclePlus} />
					Add todo
				</button>
				<button
					class="btn btn-info flex-1"
					class:hidden={!restProps.onAttachToProject}
					on:click={() => restProps.onAttachToProject?.(category)}
				>
					<Fa icon={faPaperclip} />
					Attach to project
				</button>
			</div>
			{#if category.items.length > 0}
				{#each category.items as todo (todo.id)}
					<div
						class="w-full"
						in:receive={{ key: todo.id }}
						out:send={{ key: todo.id }}
						animate:flip={{ duration: 200 }}
					>
						<TodoItem {todo} {category} {...restProps}></TodoItem>
					</div>
				{/each}
			{:else}
				<Empty class="mt-2 w-full justify-start" text="Add your first todo!" />
			{/if}
		</div>
	</div>
</Draggable>
