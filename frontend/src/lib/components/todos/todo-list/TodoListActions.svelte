<script lang="ts" context="module">
	import Spinner from '$components/Spinner.svelte';
	import Alert from '$components/Alert.svelte';
	import FormInput from '$components/forms/FormInput.svelte';

	import { page } from '$app/stores';
	import { callServiceInClient } from '$lib/client-wrapper/wrapper.client';
	import { TodoCategoryClient } from '$lib/client-wrapper/clients';
	import { Action, type TodoCategory } from '$lib/generated-client';
	import type { CommonComponentStates } from '$lib';
	import { getTodosStoreFromContext } from '$components/todos/utils';

	export type Props = {
		category: TodoCategory;
	};
</script>

<script lang="ts">
	const { category } = $props<Props>();

	let componentState = $state<CommonComponentStates>('none');
	let apiErrorTitle = $state<string | null>(null);

	const todoCategoriesStore = getTodosStoreFromContext();

	async function handleUpdateAction(event: Event) {
		componentState = 'calling-service';
		const cachedCheckedState = (event.target as HTMLInputElement).checked;
		await callServiceInClient({
			serviceCall: async () => {
				const result = await TodoCategoryClient({ token: $page.data.token }).updateItemTodoCategory(
					{
						id: category.id,
						actions: [(event.target as HTMLInputElement).name as Action]
					}
				);

				todoCategoriesStore?.updateCategory(result);
				componentState = 'none';
				apiErrorTitle = null;
			},
			errorCallback: async (e) => {
				apiErrorTitle = e.message;
				componentState = 'none';
				(event.target as HTMLInputElement).checked = cachedCheckedState;
			}
		});
	}
</script>

<Alert type="error" message={apiErrorTitle} class="mb-2" />
{#each Object.values(Action) as action}
	<div class="relative">
		<Spinner visible={componentState === 'calling-service'}></Spinner>
		<FormInput
			label="Mark as done when dropped"
			name={action}
			inputClasses="checkbox-warning"
			labelClasses="flex max-w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-info p-3"
			onchange={handleUpdateAction}
			checked={category.actions.some((value) => value.action == action)}
		></FormInput>
	</div>
{/each}
