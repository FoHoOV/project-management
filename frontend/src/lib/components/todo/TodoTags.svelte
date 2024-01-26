<script lang="ts" context="module">
	export type Feature = 'add-tag' | 'edit-tag';
	export type DispatcherEventTypes = {
		editTag: { tag: TodoItemPartialTag };
		addTag: { todo: TodoCategoryPartialTodoItem };
	};

	export type CallBackEventTypes = DispatcherToCallbackEvent<DispatcherEventTypes>;

	export type Props = {
		todo: TodoCategoryPartialTodoItem;
		enabledFeatures: Feature[] | null;
	} & Partial<CallBackEventTypes>;
</script>

<script script lang="ts">
	import { page } from '$app/stores';
	import Spinner from '$components/Spinner.svelte';
	import Alert from '$components/Alert.svelte';
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
	import todos from '$lib/stores/todos/todos';
	import Confirm from '$components/Confirm.svelte';
	import type { DispatcherToCallbackEvent } from '$lib/utils/types/dispatcher-type-to-callback-events';

	const { todo, enabledFeatures = null, ...restProps } = $props<Props>();

	let componentState = $state<'calling-service' | 'none'>('none');
	let apiErrorTitle = $state<string | null>(null);
	let deleteTagConfirms = $state<Confirm[]>([]);

	async function handleDetachTag(tag: TodoItemPartialTag) {
		componentState = 'calling-service';
		await callServiceInClient({
			serviceCall: async () => {
				await TagClient({ token: $page.data.token }).detachFromTodoTag({
					tag_id: tag.id,
					todo_id: todo.id
				});
				todos.detachTag(todo.id, tag);
				componentState = 'none';
				apiErrorTitle = null;
			},
			errorCallback: async (e) => {
				apiErrorTitle = e.message;
				componentState = 'none';
			}
		});
	}

	async function handleDeleteTag(tag: TodoItemPartialTag) {
		componentState = 'calling-service';
		await callServiceInClient({
			serviceCall: async () => {
				await TagClient({ token: $page.data.token }).deleteTag(tag);
				todos.deleteTag(tag);
				componentState = 'none';
				apiErrorTitle = null;
			},
			errorCallback: async (e) => {
				apiErrorTitle = e.message;
				componentState = 'none';
			}
		});
	}

	function handleAddTag() {
		restProps?.onAddTag?.({ todo: todo });
	}

	function handleEditTag(tag: TodoItemPartialTag) {
		restProps?.onEditTag?.({ tag: tag });
	}
</script>

<div class="relative flex flex-col">
	<Spinner visible={componentState === 'calling-service'}></Spinner>
	<Alert type="error" message={apiErrorTitle} class="mb-2" />
	<button
		on:click={handleAddTag}
		class="btn btn-square btn-success w-full"
		class:hidden={!enabledFeatures?.includes('add-tag')}
	>
		<Fa icon={faPlus} />
		<p>add tag</p>
	</button>
	{#if todo.tags.length == 0}
		<div class="my-5 flex flex-row items-center gap-2">
			{#if !enabledFeatures?.includes('add-tag')}
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
			>
				<Confirm bind:this={deleteTagConfirms[i]} on:onConfirm={() => handleDeleteTag(tag)}
				></Confirm>
				<div class="card-body">
					<div class="card-actions box-border justify-end">
						<div
							class="tooltip tooltip-warning tooltip-top tooltip-left"
							data-tip="delete tag from this project"
						>
							<button
								class="btn btn-square btn-error btn-sm"
								on:click={() => deleteTagConfirms[i].show()}
							>
								<Fa icon={faTrashCan}></Fa>
							</button>
						</div>

						<div
							class="tooltip tooltip-warning tooltip-top tooltip-left"
							data-tip="detach tag from this item"
						>
							<button class="btn btn-square btn-error btn-sm" on:click={() => handleDetachTag(tag)}>
								<Fa icon={faUnlink} class="text-error-content"></Fa>
							</button>
						</div>

						<div
							class:hidden={!enabledFeatures?.includes('edit-tag')}
							class="tooltip tooltip-info tooltip-top tooltip-left"
							data-tip="edit tag name"
						>
							<button class="btn btn-square btn-info btn-sm" on:click={() => handleEditTag(tag)}>
								<Fa icon={faEdit} class="text-info-content"></Fa>
							</button>
						</div>
					</div>

					<div class="flex items-center gap-2">
						<span>tag name:</span>
						<span class="whitespace-pre-wrap break-words font-bold">{tag.name}</span>
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
