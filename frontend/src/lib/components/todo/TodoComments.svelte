<script lang="ts" context="module">
	export type Feature = 'create-comment' | 'edit-comment';
	export type DispatcherEventTypes = {
		editComment: { comment: TodoComment };
		createComment: { todoId: number };
	};

	export type CallBackEventTypes = DispatcherToCallbackEvent<DispatcherEventTypes>;

	export type Props = {
		todoId: number;
		enabledFeatures: Feature[] | null;
	} & Partial<CallBackEventTypes>;
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
	import { onMount } from 'svelte';
	import todoComments from '$lib/stores/todo-comments';
	import { flip } from 'svelte/animate';
	import Confirm from '$components/Confirm.svelte';
	import type { DispatcherToCallbackEvent } from '$lib/utils/types/dispatcher-type-to-callback-events';

	const { todoId, enabledFeatures = null, ...restProps } = $props<Props>();

	export async function refreshComments() {
		componentState = 'calling-service';
		await callServiceInClient({
			serviceCall: async () => {
				const result = await TodoItemCommentClient({
					token: $page.data.token
				}).listTodoItemComment(todoId);

				todoComments.setOpenedTodoComments(result);
				componentState = 'none';
				apiErrorTitle = null;
			},
			errorCallback: async (e) => {
				apiErrorTitle = e.message;
				componentState = 'none';
			}
		});
	}

	let componentState = $state<'calling-service' | 'none'>('none');
	let apiErrorTitle = $state<string | null>(null);
	let deleteCommentConfirms = $state<Confirm[]>([]);

	async function handleDeleteComment(comment: TodoComment) {
		componentState = 'calling-service';
		await callServiceInClient({
			serviceCall: async () => {
				await TodoItemCommentClient({ token: $page.data.token }).deleteTodoItemComment(comment);
				todoComments.deleteComment(comment);
				componentState = 'none';
				apiErrorTitle = null;
			},
			errorCallback: async (e) => {
				apiErrorTitle = e.message;
				componentState = 'none';
			}
		});
	}

	function handleCreateComment() {
		restProps?.onCreateComment?.({ todoId: todoId });
	}

	function handleEditComment(comment: TodoComment) {
		restProps?.onEditComment?.({ comment: comment });
	}

	onMount(() => {
		refreshComments();
	});
</script>

<div class="flex flex-col">
	<Spinner visible={componentState === 'calling-service'}></Spinner>
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
					bind:this={deleteCommentConfirms[i]}
					on:onConfirm={() => handleDeleteComment(comment)}
				></Confirm>
				<div class="card-body">
					<div class="card-actions justify-end">
						<button
							class="btn btn-square btn-error btn-sm"
							on:click={() => deleteCommentConfirms[i].show()}
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
