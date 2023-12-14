<script lang="ts" context="module">
	export type Feature = 'add-tag' | 'edit-tag';
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
		faPenNib,
		faPlus,
		faPlusCircle,
		faTrashCan,
		faUnlink
	} from '@fortawesome/free-solid-svg-icons';
	import { createEventDispatcher } from 'svelte';
	import { flip } from 'svelte/animate';
	import type { TodoItem, TodoItemPartialTag } from '$lib/generated-client';
	import todos from '$lib/stores/todos/todos';
	import Confirm from '$components/Confirm.svelte';

	export let todo: TodoItem;
	export let enabledFeatures: Feature[] | null = null;

	let state: 'calling-service' | 'none' = 'none';
	let apiErrorTitle: string | null = null;
	let confirmsDeleteTag: Confirm[] = [];

	const dispatch = createEventDispatcher<{
		editTag: { tag: TodoItemPartialTag };
		addTag: { todo: TodoItem };
	}>();

	async function handleDetachTag(tag: TodoItemPartialTag) {
		state = 'calling-service';
		await callServiceInClient({
			serviceCall: async () => {
				await TagClient({ token: $page.data.token }).detachFromTodoTag({
					tag_id: tag.id,
					todo_id: todo.id
				});
				todos.detachTag(todo.id, tag);
				state = 'none';
			},
			errorCallback: async (e) => {
				apiErrorTitle = e.message;
				state = 'none';
			}
		});
	}

	async function handleDeleteTag(tag: TodoItemPartialTag) {
		state = 'calling-service';
		await callServiceInClient({
			serviceCall: async () => {
				await TagClient({ token: $page.data.token }).deleteTag(tag);
				todos.deleteTag(tag);
				state = 'none';
			},
			errorCallback: async (e) => {
				apiErrorTitle = e.message;
				state = 'none';
			}
		});
	}

	function handleAddTag() {
		dispatch('addTag', { todo: todo });
	}

	function handleEditTag(tag: TodoItemPartialTag) {
		dispatch('editTag', { tag: tag });
	}
</script>

<div class="relative flex flex-col">
	<Spinner visible={state === 'calling-service'}></Spinner>
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
		<div
			class="my-5 flex flex-row items-center gap-2"
			class:hidden={!enabledFeatures?.includes('add-tag')}
		>
			<Fa icon={faPlusCircle} />
			<p class="break-words text-lg">add tags using the plus sign above</p>
		</div>
	{:else}
		{#each todo.tags as tag, i (tag.id)}
			<div
				class="card relative mt-4 max-h-44 overflow-y-auto !bg-base-200 shadow-xl hover:bg-base-100"
				animate:flip={{ duration: 200 }}
			>
				<Confirm bind:this={confirmsDeleteTag[i]} on:onConfirm={() => handleDeleteTag(tag)}
				></Confirm>
				<div class="card-body">
					<div class="card-actions justify-end">
						<button
							class="btn btn-square btn-error btn-sm"
							on:click={() => confirmsDeleteTag[i].show()}
						>
							<Fa icon={faTrashCan}></Fa>
						</button>
						<button class="btn btn-square btn-error btn-sm" on:click={() => handleDetachTag(tag)}>
							<Fa icon={faUnlink}></Fa>
						</button>
						<button
							class="btn btn-square btn-info btn-sm"
							class:hidden={!enabledFeatures?.includes('edit-tag')}
							on:click={() => handleEditTag(tag)}
						>
							<Fa icon={faEdit}></Fa>
						</button>
					</div>
					<p class="whitespace-pre-wrap break-words font-bold">
						{tag.name}
					</p>
				</div>
			</div>
		{/each}
	{/if}
</div>
