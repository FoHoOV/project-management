<script context="module" lang="ts">
	export type Props = {
		category: TodoCategory;
	};
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import Spinner from '$components/Spinner.svelte';
	import Alert from '$components/Alert.svelte';
	import { callServiceInClient } from '$lib/client-wrapper/wrapper.client';
	import { TodoCategoryClient } from '$lib/client-wrapper/clients';
	import { Action, type TodoCategory } from '$lib/generated-client';
	import todos from '$lib/stores/todos';

	const { category } = $props<Props>();

	let componentState = $state<'calling-service' | 'none'>('none');
	let apiErrorTitle = $state<string | null>(null);

	async function handleUpdateAction(event: Event) {
		componentState = 'calling-service';
		await callServiceInClient({
			serviceCall: async () => {
				const result = await TodoCategoryClient({ token: $page.data.token }).updateItemTodoCategory(
					{
						id: category.id,
						actions: (event.target as HTMLInputElement).checked ? [Action.Done] : [Action.Undone]
					}
				);

				todos.updateCategory(result);
				componentState = 'none';
				apiErrorTitle = null;
			},
			errorCallback: async (e) => {
				apiErrorTitle = e.message;
				componentState = 'none';
				(event.target as HTMLInputElement).checked = false;
			}
		});
	}
</script>

<div class="relative">
	<Spinner visible={componentState === 'calling-service'}></Spinner>
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
