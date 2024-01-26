<script lang="ts" context="module">
	export type Feature = 'create-comment' | 'edit-comment';
	export type EventTypes = {
		editComment: { comment: TodoComment };
		createComment: { todoId: number };
	};
</script>

<script script lang="ts">
	import { page } from '$app/stores';
	import Spinner from '$components/Spinner.svelte';
	import Alert from '$components/Alert.svelte';
	import { TodoItemCommentClient } from '$lib/client-wrapper/clients';
	import { callServiceInClient } from '$lib/client-wrapper/wrapper.client';
	import type { TodoComment } from '$lib/generated-client/zod/schemas';
	import Fa from 'svelte-fa';
	import { faEdit, faPlus, faPlusCircle, faTrashCan } from '@fortawesome/free-solid-svg-icons';
	import { createEventDispatcher } from 'svelte';
	import todoComments from '$lib/stores/todo-comments';
	import { flip } from 'svelte/animate';
	import Confirm from '$components/Confirm.svelte';

	export let todoId: number;
	export let enabledFeatures: Feature[] | null = null;

	export async function refreshComments() {
		await callServiceInClient({
			serviceCall: async () => {
				const result = await TodoItemCommentClient({
					token: $page.data.token
				}).listTodoItemComment(todoId);

				todoComments.setOpenedTodoComments(result);
				state = 'none';
				apiErrorTitle = null;
			},
			errorCallback: async (e) => {
				apiErrorTitle = e.message;
				state = 'none';
			}
		});
	}

	let state: 'calling-service' | 'none' = 'calling-service';
	let apiErrorTitle: string | null = null;
	let confirmsDeleteComment: Confirm[] = [];

	const dispatch = createEventDispatcher<EventTypes>();

	async function handleDeleteComment(comment: TodoComment) {
		state = 'calling-service';
		await callServiceInClient({
			serviceCall: async () => {
				await TodoItemCommentClient({ token: $page.data.token }).deleteTodoItemComment(comment);
				todoComments.deleteComment(comment);
				state = 'none';
				apiErrorTitle = null;
			},
			errorCallback: async (e) => {
				apiErrorTitle = e.message;
				state = 'none';
			}
		});
	}

	function handleCreateComment() {
		dispatch('createComment', { todoId: todoId });
	}

	function handleEditComment(comment: TodoComment) {
		dispatch('editComment', { comment: comment });
	}
</script>

<div class="flex flex-col">
	<Spinner visible={state === 'calling-service'}></Spinner>
	<Alert type="error" message={apiErrorTitle} class="mb-2" />
	<button
		on:click={handleCreateComment}
		class="btn btn-square btn-success w-full"
		class:hidden={!enabledFeatures?.includes('create-comment')}
	>
		<Fa icon={faPlus} />
		<p>add comment</p>
	</button>
	{#if $todoComments.length == 0 || $todoComments[0].todo_id != todoId}
		<div class="my-5 flex flex-row items-center gap-2">
			{#if !enabledFeatures?.includes('create-comment')}
				No comments
			{:else}
				<Fa icon={faPlusCircle} />
				<p class="break-words text-lg">create your first comments using the plus sign</p>
			{/if}
		</div>
	{:else}
		{#each $todoComments as comment, i (comment.id)}
			<div
				class="card relative mt-4 max-h-44 overflow-y-auto !bg-base-200 shadow-xl hover:bg-base-100"
				animate:flip={{ duration: 200 }}
			>
				<Confirm
					bind:this={confirmsDeleteComment[i]}
					on:onConfirm={() => handleDeleteComment(comment)}
				></Confirm>
				<div class="card-body">
					<div class="card-actions justify-end">
						<button
							class="btn btn-square btn-error btn-sm"
							on:click={() => confirmsDeleteComment[i].show()}
						>
							<Fa icon={faTrashCan}></Fa>
						</button>
						<button
							class="btn btn-square btn-info btn-sm"
							class:hidden={!enabledFeatures?.includes('edit-comment')}
							on:click={() => handleEditComment(comment)}
						>
							<Fa icon={faEdit}></Fa>
						</button>
					</div>
					<p class="whitespace-pre-wrap break-words font-bold">
						{comment.message}
					</p>
				</div>
			</div>
		{/each}
	{/if}
</div>
