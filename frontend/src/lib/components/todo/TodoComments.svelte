<script lang="ts" context="module">
	export type Feature = 'create-comment' | 'edit-comment';
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
	import { createEventDispatcher, onMount } from 'svelte';
	import todoComments from '$lib/stores/todo-comments';
	import { flip } from 'svelte/animate';
	import Modal from '$components/popups/Modal.svelte';

	export let todoId: number;
	export let enabledFeatures: Feature[] | null = null;

	export async function show() {
		await callServiceInClient({
			serviceCall: async () => {
				const result = await TodoItemCommentClient({
					token: $page.data.token
				}).listTodoItemComment(todoId);
				state = 'none';
				todoComments.setOpenedTodoComments(result);
				console.log($todoComments);
			},
			errorCallback: async (e) => {
				apiErrorTitle = e.message;
				state = 'none';
			}
		});
		modal.show();
	}

	let state: 'calling-service' | 'none' = 'calling-service';
	let modal: Modal;
	let apiErrorTitle: string | null = null;

	const dispatch = createEventDispatcher<{
		editComment: { comment: TodoComment };
		createComment: { todoId: number };
	}>();

	async function handleDeleteComment(comment: TodoComment) {
		await callServiceInClient({
			serviceCall: async () => {
				await TodoItemCommentClient({ token: $page.data.token }).deleteTodoItemComment(comment);
				todoComments.deleteComment(comment);
				state = 'none';
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

<Modal
	class="cursor-default border border-success border-opacity-20"
	title="Manage your todo comments here"
	bind:this={modal}
	dialogProps={{
		//@ts-ignore
		//TODO: another ugly hack which will be solved by svelte5
		ondragstart: 'event.preventDefault();event.stopPropagation();',
		draggable: true
	}}
>
	<div slot="body" class="relative flex flex-col">
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
			<div class="my-2 flex flex-row items-center gap-2">
				<Fa icon={faPlusCircle} />
				<p class="break-words text-lg font-bold">create your first comments using the plus sign</p>
			</div>
		{:else}
			{#each $todoComments as comment (comment.id)}
				<div
					class="card mt-4 max-h-44 overflow-y-auto !bg-base-200 shadow-xl hover:bg-base-100"
					animate:flip={{ duration: 200 }}
				>
					<div class="card-body">
						<div class="card-actions justify-end">
							<button
								class="btn btn-square btn-error btn-sm"
								on:click={() => handleDeleteComment(comment)}
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
</Modal>
