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
	const { category }: Props = $props();

	let componentState = $state<CommonComponentStates>('none');
	let apiErrorTitle = $state<string | null>(null);

	const todoCategoriesStore = getTodosStoreFromContext();

	async function handleUpdateAction(event: Event) {
		componentState = 'calling-service';
		await callServiceInClient({
			call: async () => {
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
			errorHandler: async (e) => {
				apiErrorTitle = e.message;
				componentState = 'none';
				(event.target as HTMLInputElement).checked = !(event.target as HTMLInputElement).checked;
			}
		});
	}
</script>

<div class="relative my-2">
	<Alert type="error" message={apiErrorTitle} class="mb-2" />
	<Spinner visible={componentState === 'calling-service'}></Spinner>
	{#each Object.values(Action) as action}
		<FormInput
			label={action.replaceAll('_', ' ')}
			name={action}
			value={action}
			inputClasses="checkbox-warning"
			labelClasses="border border-info"
			wrapperClasses="my-2"
			onchange={handleUpdateAction}
			type="checkbox"
			checked={category.actions.some((value) => value.action == action)}
		></FormInput>
	{/each}
</div>
