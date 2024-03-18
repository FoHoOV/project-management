<script lang="ts" context="module">
	import TodoItem from '$components/todos/todo-item/TodoItem.svelte';
	import EnhancedForm from '$components/forms/EnhancedForm.svelte';
	import LoadingButton from '$components/buttons/LoadingButton.svelte';
	import FormInput from '$components/forms/FormInput.svelte';
	import Fa from 'svelte-fa';

	import type { TodoCategory, TodoItem as TodoItemModel } from '$lib/generated-client/models';
	import { searchTagSchema } from '$routes/user/search-tags/validator';
	import { TodoCategories } from '$lib/stores/todos/todos.svelte.js';
	import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
	import { setTodosStoreToContext } from '$components/todos/utils.js';
</script>

<script lang="ts">
	const { form } = $props();

	let enhancedForm = $state<EnhancedForm<any, any, any> | null>(null);

	const todoCategoriesStore = setTodosStoreToContext(new TodoCategories());

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
</script>

<svelte:head>
	<title>search by tag</title>
</svelte:head>

<EnhancedForm
	bind:this={enhancedForm}
	action="/user/search-tags?/search"
	enhancerConfig={{
		form: form,
		action: 'search',
		resetOnSubmit: false,
		validator: { schema: searchTagSchema }
	}}
	onSubmitSucceeded={async (event) => {
		handleShowResults(event.response);
	}}
	showResetButton={false}
>
	{#snippet inputs({ formErrors })}
		<FormInput type="text" label="tag name" name="name" errors={formErrors?.errors?.name}
		></FormInput>
		<FormInput
			type="text"
			label="project id (Optional)"
			name="projectId"
			errors={formErrors?.errors?.projectId?.toString()}
		></FormInput>
	{/snippet}

	{#snippet actions({ loading, reset })}
		<LoadingButton text="Search" class="btn-success flex-1" type="submit" {loading} />
		<LoadingButton text="Reset" class="btn-warning flex-1" type="button" on:click={reset} />
	{/snippet}
</EnhancedForm>

<div
	class="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3"
	data-testid="search-tags-results-wrapper"
>
	{#each todoCategoriesStore.current as category (category.id)}
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
