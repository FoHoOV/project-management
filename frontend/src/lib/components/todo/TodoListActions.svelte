<script lang="ts">
	import { page } from '$app/stores';
	import Spinner from '$components/Spinner.svelte';
	import Alert from '$components/Alert.svelte';
	import { callServiceInClient } from '$lib/client-wrapper/wrapper.client';
	import { TodoCategoryClient } from '$lib/client-wrapper/clients';
	import { Action, ErrorCode, type TodoCategory } from '$lib/generated-client';
	import todos from '$lib/stores/todos';
	import { ErrorType } from '$lib/client-wrapper/wrapper.universal';
	import toasts from '$lib/stores/toasts';

	export let category: TodoCategory;
	let state: 'calling-service' | 'none' = 'none';
	let apiErrorTitle: string | null = null;

	async function handleUpdateAction(event: Event) {
		state = 'calling-service';
		await callServiceInClient({
			serviceCall: async () => {
				const result = await TodoCategoryClient({ token: $page.data.token }).updateItemTodoCategory(
					{
						id: category.id,
						actions: (event.target as HTMLInputElement).checked ? [Action.Done] : [Action.Undone]
					}
				);

				todos.updateCategory(result);
				state = 'none';
				apiErrorTitle = null;
			},
			errorCallback: async (e) => {
				apiErrorTitle = e.message;
				state = 'none';
				(event.target as HTMLInputElement).checked = false;
			}
		});
	}
</script>

<div class="relative">
	<Spinner visible={state === 'calling-service'}></Spinner>
	<Alert type="error" message={apiErrorTitle} class="mb-2" />
	<label
		class="label flex max-w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-info p-3"
	>
		<span> Mark as done when dropped </span>
		<input
			type="checkbox"
			class="checkbox-warning checkbox"
			checked={category.actions.filter((action) => action.action == Action.Done).length > 0}
			on:change={handleUpdateAction}
		/>
	</label>
</div>
