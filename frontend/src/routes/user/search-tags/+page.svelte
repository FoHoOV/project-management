<script lang="ts" module>
	import TodoItem from '#lib/components/todos/todo-item/TodoItem.svelte';
	import EnhancedForm from '#lib/components/forms/EnhancedForm.svelte';
	import type { EnhanceOptions } from '#lib/actions/form/index.js';
	import type { ActionData } from './$types';
	import LoadingButton from '#lib/components/buttons/LoadingButton.svelte';
	import FormInput from '#lib/components/forms/FormInput.svelte';
	import Fa from 'svelte-fa';

	import type { TodoCategory, TodoItem as TodoItemModel } from '#lib/generated-client/index.js';
	import { searchTagSchema } from './validator';
	import { TodoCategories } from '#lib/stores/todos/todos.svelte.js';
	import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
	import { setTodoCategories } from '#lib/stores/index.js';
	import type { ComponentExports } from '#lib/utils/types/svelte.js';
</script>

<script lang="ts">
	let enhancedForm = $state<ComponentExports<typeof EnhancedForm> | null>(null);

	const todoCategoriesStore = setTodoCategories(new TodoCategories());

	function handleShowResults(result: TodoItemModel[]) {
		if (result.length == 0) {
			todoCategoriesStore.clearCategories();
			return;
		}
		const categories: TodoCategory[] = [];
		result.forEach((todo) => {
			todo = { ...todo, order: { right_id: null, left_id: null } };
			let index = categories.findIndex((category) => category.id == todo.category_id);
			if (index >= 0) {
				categories[index].items.push(todo);
			} else {
				categories.push({
					id: todo.category_id,
					title: '',
					description: '',
					items: [todo],
					orders: [],
					projects: [],
					actions: []
				});
			}
		});
		todoCategoriesStore.setCategories(categories);
	}

	const enhancerConfig: EnhanceOptions<typeof searchTagSchema, ActionData, 'search'> = {
		actionName: 'search',
		resetOnSubmit: false,
		validator: { schema: searchTagSchema }
	};
</script>

<svelte:head>
	<title>search by tag</title>
</svelte:head>

<EnhancedForm
	bind:this={enhancedForm}
	action="/user/search-tags?/search"
	{enhancerConfig}
	onSubmitSucceeded={async (event) => {
		handleShowResults(event.response);
	}}
	showResetButton={false}
>
	{#snippet inputs({ formErrors })}
		<FormInput
			type="text"
			label="tag name"
			name="name"
			errors={formErrors?.errors?.name}
			data-testid="tag-name-input"
		></FormInput>
		<FormInput
			type="text"
			label="project id (Optional)"
			name="project_id"
			errors={formErrors?.errors?.project_id?.toString()}
			data-testid="project-id-input"
		></FormInput>
	{/snippet}

	{#snippet actions({ loading, reset })}
		<LoadingButton text="Search" class="btn-success flex-1" type="submit" {loading} />
		<LoadingButton
			text="Reset"
			class="btn-warning flex-1"
			type="button"
			onclick={reset}
			data-testid="tags-reset-btn"
		/>
	{/snippet}
</EnhancedForm>

<div
	class="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3"
	data-testid="search-tags-results-wrapper"
>
	{#each todoCategoriesStore.value$ as category (category.id)}
		{#each category.items as todo (todo.id)}
			<TodoItem {todo} showCategoryInfo={true} showProjectsInfo={true} draggable={false}></TodoItem>
		{/each}
	{:else}
		<div
			class="mt-5 flex items-center gap-2 text-lg font-bold text-warning"
			class:hidden={enhancedForm?.formState() !== 'submit-successful'}
		>
			<Fa icon={faCircleNotch}></Fa>
			<span>no results</span>
		</div>
	{/each}
</div>
