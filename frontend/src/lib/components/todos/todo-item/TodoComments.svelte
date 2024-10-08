<script lang="ts" module>
	import Spinner from '$components/Spinner.svelte';
	import Alert from '$components/alerts/Alert.svelte';
	import Confirm from '$components/Confirm.svelte';

	import { page } from '$app/stores';
	import { TodoItemCommentClient } from '$lib/client-wrapper/clients';
	import { callServiceInClient } from '$lib/client-wrapper/wrapper.client';
	import type { TodoComment } from '$lib/generated-client/zod/schemas';
	import Fa from 'svelte-fa';
	import { faEdit, faPlus, faPlusCircle, faTrashCan } from '@fortawesome/free-solid-svg-icons';
	import { onMount } from 'svelte';
	import { TodoComments, getTodoComments, setTodoComments, getTodoCategories } from '$lib/stores';
	import { flip } from 'svelte/animate';
	import { type CommonComponentStates } from '$lib';
	import type { ComponentExports } from '$lib/utils/types/svelte';

	export type Events = {
		onEditComment?: (comment: TodoComment, store: TodoComments) => void;
		onCreateComment?: (todoId: number, store: TodoComments) => void;
	};

	export type Props = {
		todoId: number;
	} & Events;
</script>

<script lang="ts">
	const { todoId, onEditComment, onCreateComment }: Props = $props();

	let componentState = $state<CommonComponentStates>('none');
	let apiErrorTitle = $state<string | null>(null);

	let deleteCommentConfirms = $state<ComponentExports<typeof Confirm>[]>([]);

	const todoCommentsStore = setTodoComments(new TodoComments(getTodoCategories()), false);

	export async function refreshComments() {
		componentState = 'calling-service';
		await callServiceInClient({
			call: async () => {
				const result = await TodoItemCommentClient({
					token: $page.data.token
				}).listTodoItemComments(todoId);

				todoCommentsStore.set(result);
				componentState = 'none';
				apiErrorTitle = null;
			},
			errorHandler: async (e) => {
				apiErrorTitle = e.message;
				componentState = 'none';
			}
		});
	}

	async function handleDeleteComment(comment: TodoComment) {
		componentState = 'calling-service';
		await callServiceInClient({
			call: async () => {
				await TodoItemCommentClient({ token: $page.data.token }).deleteTodoItemComments(
					comment.todo_id,
					comment.id
				);
				todoCommentsStore.remove(comment);
				componentState = 'none';
				apiErrorTitle = null;
			},
			errorHandler: async (e) => {
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
	<Alert type="error" message={new String(apiErrorTitle)} class="mb-2" />
	<button
		onclick={() => onCreateComment?.(todoId, todoCommentsStore)}
		class="btn btn-square btn-success w-full"
		class:hidden={!onCreateComment}
	>
		<Fa icon={faPlus} />
		<p>add comment</p>
	</button>

	{#each todoCommentsStore.value$ as comment, i (comment.id)}
		<div
			class="card relative mt-4 max-h-44 overflow-y-auto !bg-base-200 shadow-xl hover:bg-base-100"
			animate:flip={{ duration: 200 }}
			data-testid="todo-comments-wrapper"
		>
			<Confirm
				bind:this={deleteCommentConfirms[i]}
				onConfirmed={() => handleDeleteComment?.(comment)}
			></Confirm>

			<div class="card-body">
				<div class="card-actions justify-end">
					<button
						class="btn btn-square btn-error btn-sm"
						onclick={() => deleteCommentConfirms[i].show()}
						data-testid="todo-comment-delete"
					>
						<Fa icon={faTrashCan}></Fa>
					</button>
					<button
						class="btn btn-square btn-info btn-sm"
						class:hidden={!onEditComment}
						onclick={() => onEditComment?.(comment, todoCommentsStore)}
					>
						<Fa icon={faEdit}></Fa>
					</button>
				</div>
				<p class="whitespace-pre-wrap break-words font-bold" data-testid="todo-comment-text">
					{comment.message}
				</p>
			</div>
		</div>
	{:else}
		<div class="my-5 flex flex-row items-center gap-2">
			{#if !onCreateComment}
				no comments
			{:else}
				<Fa icon={faPlusCircle} />
				<p class="break-words text-lg">create your first comments using the plus sign</p>
			{/if}
		</div>
	{/each}
</div>
