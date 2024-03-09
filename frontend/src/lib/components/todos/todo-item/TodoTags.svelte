<script lang="ts" context="module">
	import Spinner from '$components/Spinner.svelte';
	import Alert from '$components/Alert.svelte';

	import { page } from '$app/stores';
	import { TagClient } from '$lib/client-wrapper/clients';
	import { callServiceInClient } from '$lib/client-wrapper/wrapper.client';
	import Fa from 'svelte-fa';
	import {
		faEdit,
		faPlus,
		faPlusCircle,
		faTrashCan,
		faUnlink
	} from '@fortawesome/free-solid-svg-icons';
	import { flip } from 'svelte/animate';
	import type { TodoCategoryPartialTodoItem, TodoItemPartialTag } from '$lib/generated-client';
	import Confirm from '$components/Confirm.svelte';
	import type { CommonComponentStates } from '$lib';
	import { getTodosStoreFromContext } from '$components/todos/utils';

	export type Events = {
		onEditTag?: (tag: TodoItemPartialTag) => void;
		onAddTag?: (todo: TodoCategoryPartialTodoItem) => void;
	};

	export type Props = {
		todo: TodoCategoryPartialTodoItem;
	} & Events;
</script>

<script script lang="ts">
	const { todo, onEditTag, onAddTag } = $props<Props>();

	let componentState = $state<CommonComponentStates>('none');
	let apiErrorTitle = $state<string | null>(null);
	let deleteTagConfirms = $state<Confirm[]>([]);
	let detachTagConfirms = $state<Confirm[]>([]);

	const todoCategoriesStore = getTodosStoreFromContext();

	async function handleDetachTag(tag: TodoItemPartialTag) {
		componentState = 'calling-service';
		await callServiceInClient({
			call: async () => {
				await TagClient({ token: $page.data.token }).detachFromTodoTag({
					tag_id: tag.id,
					todo_id: todo.id
				});
				todoCategoriesStore?.detachTag(todo.id, tag);
				componentState = 'none';
				apiErrorTitle = null;
			},
			errorHandler: async (e) => {
				apiErrorTitle = e.message;
				componentState = 'none';
			}
		});
	}

	async function handleDeleteTag(tag: TodoItemPartialTag) {
		componentState = 'calling-service';
		await callServiceInClient({
			call: async () => {
				await TagClient({ token: $page.data.token }).deleteTag(tag);
				todoCategoriesStore?.deleteTag(tag);
				componentState = 'none';
				apiErrorTitle = null;
			},
			errorHandler: async (e) => {
				apiErrorTitle = e.message;
				componentState = 'none';
			}
		});
	}
</script>

<div class="relative flex flex-col">
	<Spinner visible={componentState === 'calling-service'}></Spinner>
	<Alert type="error" message={apiErrorTitle} class="mb-2" />
	<button
		on:click={() => onAddTag?.(todo)}
		class="btn btn-square btn-success w-full"
		class:hidden={!onAddTag}
	>
		<Fa icon={faPlus} />
		<p>add tag</p>
	</button>
	{#if todo.tags.length == 0}
		<div class="my-5 flex flex-row items-center gap-2">
			{#if !onAddTag}
				No tags
			{:else}
				<Fa icon={faPlusCircle} />
				<p class="break-words text-lg">add tags using the plus sign above</p>
			{/if}
		</div>
	{:else}
		{#each todo.tags as tag, i (tag.id)}
			<div
				class="card relative mt-4 max-h-44 overflow-y-auto !bg-base-200 shadow-xl hover:bg-base-100"
				animate:flip={{ duration: 200 }}
				data-testid="todo-tags-wrapper"
			>
				<Confirm bind:this={deleteTagConfirms[i]} onConfirmed={() => handleDeleteTag(tag)}
				></Confirm>
				<Confirm bind:this={detachTagConfirms[i]} onConfirmed={() => handleDetachTag(tag)}
				></Confirm>

				<div class="card-body">
					<div class="card-actions box-border justify-end">
						<div
							class="tooltip tooltip-top tooltip-left tooltip-warning"
							data-tip="delete tag from this project"
						>
							<button
								class="btn btn-square btn-error btn-sm"
								on:click={() => deleteTagConfirms[i].show()}
								data-testid="todo-tag-delete"
							>
								<Fa icon={faTrashCan}></Fa>
							</button>
						</div>

						<div
							class="tooltip tooltip-top tooltip-left tooltip-warning"
							data-tip="detach tag from this item"
						>
							<button
								class="btn btn-square btn-error btn-sm"
								on:click={() => detachTagConfirms[i].show()}
							>
								<Fa icon={faUnlink} class="text-error-content"></Fa>
							</button>
						</div>

						<div
							class:hidden={!onEditTag}
							class="tooltip tooltip-top tooltip-left tooltip-info"
							data-tip="edit tag name"
						>
							<button class="btn btn-square btn-info btn-sm" on:click={() => onEditTag?.(tag)}>
								<Fa icon={faEdit} class="text-info-content"></Fa>
							</button>
						</div>
					</div>

					<div class="flex items-center gap-2">
						<span>tag name:</span>
						<span class="whitespace-pre-wrap break-words font-bold" data-testid="todo-tag-text"
							>{tag.name}</span
						>
					</div>

					<div class="flex items-center gap-2">
						<span>project id:</span>
						<span class="whitespace-pre-wrap break-words font-bold">{tag.project_id}</span>
					</div>
				</div>
			</div>
		{/each}
	{/if}
</div>
