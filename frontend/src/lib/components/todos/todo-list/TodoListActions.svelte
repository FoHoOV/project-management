<script lang="ts" module>
	import Spinner from '#lib/components/Spinner.svelte';
	import Alert from '#lib/components/alerts/Alert.svelte';
	import FormInput from '#lib/components/forms/FormInput.svelte';

	import { callService } from '#lib/client-wrapper/index.js';
	import { createApiClient } from '#lib/api-client.js';
	import { updateTodoCategories } from '#lib/generated-client/index.js';
	import { Action, type TodoCategory } from '#lib/generated-client/index.js';
	import { type CommonComponentStates } from '#lib';
	import { getTodoCategories } from '#lib/stores/index.js';

	export type Props = {
		category: TodoCategory;
	};
</script>

<script lang="ts">
	const { category }: Props = $props();

	let componentState = $state<CommonComponentStates>('none');
	let apiErrorTitle = $state<string | null>(null);

	const todoCategoriesStore = getTodoCategories();

	async function handleUpdateAction(event: Event) {
		componentState = 'calling-service';
		await callService({
			call: async () => {
				const result = await updateTodoCategories({
					client: createApiClient(),
					path: { category_id: category.id },
					body: {
						item: {
							actions: [(event.target as HTMLInputElement).name as Action]
						}
					}
				});

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
	<Alert type="error" message={new String(apiErrorTitle)} class="mb-2" />
	<Spinner visible={componentState === 'calling-service'}></Spinner>
	{#each Object.values(Action) as action (action)}
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
