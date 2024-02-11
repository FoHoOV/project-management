<script lang="ts" context="module">
	import Spinner from '$components/Spinner.svelte';
	import Alert from '$components/Alert.svelte';
	import Confirm from '$components/Confirm.svelte';

	import { page } from '$app/stores';
	import { TodoItemCommentClient } from '$lib/client-wrapper/clients';
	import { callServiceInClient } from '$lib/client-wrapper/wrapper.client';
	import type { TodoComment } from '$lib/generated-client/zod/schemas';
	import Fa from 'svelte-fa';
	import { faEdit, faPlus, faPlusCircle, faTrashCan } from '@fortawesome/free-solid-svg-icons';
	import { onMount } from 'svelte';
	import { todoComments } from '$lib/stores/todo-comments';
	import { flip } from 'svelte/animate';

	export type Events = {
		onEditComment?: (comment: TodoComment) => void;
		onCreateComment?: (todoId: number) => void;
	};

	export type Props = {
		todoId: number;
	} & Events;
</script>

<script script lang="ts">
	const { todoId, onEditComment, onCreateComment } = $props<Props>();

	let componentState = $state<'calling-service' | 'none'>('none');
	let apiErrorTitle = $state<string | null>(null);
	// TODO: https://github.com/sveltejs/svelte/issues/10427
	// because of this issue bound `confirm` doesnt work in a keyed each block, waiting for a fix :(
	let deleteCommentConfirms = $state<Confirm[]>([]);

	export async function refreshComments() {
		componentState = 'calling-service';
		await callServiceInClient({
			serviceCall: async () => {
				const result = await TodoItemCommentClient({
					token: $page.data.token
				}).listTodoItemComment(todoId);

				todoComments.set(result);
				componentState = 'none';
				apiErrorTitle = null;
			},
			errorCallback: async (e) => {
				apiErrorTitle = e.message;
				componentState = 'none';
			}
		});
	}

	async function handleDeleteComment(comment: TodoComment) {
		componentState = 'calling-service';
		await callServiceInClient({
			serviceCall: async () => {
				await TodoItemCommentClient({ token: $page.data.token }).deleteTodoItemComment(comment);
				todoComments.remove(comment);
				componentState = 'none';
				apiErrorTitle = null;
			},
			errorCallback: async (e) => {
				apiErrorTitle = e.message;
				componentState = 'none';
			}
		});
	}

	onMount(() => {
		refreshComments();
	});
</script>

<div class="flex flex-col">
	<Spinner visible={componentState === 'calling-service'}></Spinner>
	<Alert type="error" message={apiErrorTitle} class="mb-2" />
	<button
		on:click={() => onCreateComment?.(todoId)}
		class="btn btn-square btn-success w-full"
		class:hidden={!onCreateComment}
	>
		<Fa icon={faPlus} />
		<p>add comment</p>
	</button>
	{#if todoComments.current.length == 0 || todoComments.current[0].todo_id != todoId}
		<div class="my-5 flex flex-row items-center gap-2">
			{#if !onCreateComment}
				no comments
			{:else}
				<Fa icon={faPlusCircle} />
				<p class="break-words text-lg">create your first comments using the plus sign</p>
			{/if}
		</div>
	{:else}
		{#each todoComments.current as comment, i (comment.id)}
			<div
				class="card relative mt-4 max-h-44 overflow-y-auto !bg-base-200 shadow-xl hover:bg-base-100"
				animate:flip={{ duration: 200 }}
			>
				<Confirm
					bind:this={deleteCommentConfirms[i]}
					on:onConfirm={() => handleDeleteComment?.(comment)}
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
							class:hidden={!onEditComment}
							on:click={() => onEditComment?.(comment)}
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
