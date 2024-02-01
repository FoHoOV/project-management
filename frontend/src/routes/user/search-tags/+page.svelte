<script lang="ts">
	import LoadingButton from '$components/buttons/LoadingButton.svelte';
	import FormInput from '$components/forms/FormInput.svelte';
	import Alert from '$components/Alert.svelte';
	import type { TodoCategory, TodoItem as TodoItemModel } from '$lib/generated-client/models';
	import { getFormErrors, superEnhance } from '$lib/actions/form';
	import { searchTagSchema } from '$routes/user/search-tags/validator';
	import { onDestroy, onMount, untrack } from 'svelte';
	import todos from '$lib/stores/todos/todos.svelte.js';
	import TodoItem from '$components/todo/TodoItem.svelte';
	import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

	const { form } = $props();

	let componentState = $state<'submitting' | 'submit-successful' | 'none'>('none');
	let formElement = $state<HTMLFormElement | null>(null);

	let formErrors = $state(getFormErrors(form));

	$effect(() => {
		form;
		untrack(() => {
			formErrors = getFormErrors(form);
		});
	});

	function resetForm() {
		formElement?.reset();
		formErrors = { errors: undefined, message: undefined };
		componentState = 'none';
	}

	function handleShowResults(result: TodoItemModel[]) {
		componentState = 'submit-successful';
		if (result.length == 0) {
			todos.clearTodoCategories();
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
		todos.setTodoCategories(categories);
	}

	onMount(() => {
		todos.setTodoCategories([]);
	});

	onDestroy(() => {
		todos.setTodoCategories([]);
	});
</script>

<svelte:head>
	<title>search by tag</title>
</svelte:head>

<form
	bind:this={formElement}
	class="px-1"
	method="post"
	action="/user/search-tags?/search"
	use:superEnhance={{
		form: form,
		action: 'search',
		resetOnSubmit: false,
		validator: { schema: searchTagSchema }
	}}
	on:submitclienterror={(e) => {
		formErrors = {
			errors: e.detail,
			message: 'Invalid form, please review your inputs'
		};
		componentState = 'none';
	}}
	on:submitstarted={() => {
		componentState = 'submitting';
	}}
	on:submitended={() => {
		componentState = 'none';
		todos.clearTodoCategories();
	}}
	on:submitsucceeded={(event) => handleShowResults(event.detail.response)}
>
	<Alert class="mb-1" type="error" message={formErrors?.message} />
	<FormInput type="text" label="tag name" name="name" errors={formErrors.errors?.name}></FormInput>
	<FormInput
		type="text"
		label="project id (Optional)"
		name="projectId"
		errors={formErrors.errors?.projectId?.toString()}
	></FormInput>
	<div class="card-actions mt-3 w-full justify-end">
		<LoadingButton
			text="Search"
			class="btn-success flex-1"
			type="submit"
			loading={componentState == 'submitting'}
		/>
		<LoadingButton text="reset" class="btn-warning flex-1" type="button" on:click={resetForm} />
	</div>
</form>

<div class="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
	{#if todos.length > 0}
		{#each todos.categories as category (category.id)}
			{#each category.items as todo (todo.id)}
				<TodoItem {todo} enabledFeatures={['show-category-title', 'show-project-id']}></TodoItem>
			{/each}
		{/each}
	{:else}
		<div
			class="mt-5 flex items-center gap-2 text-lg font-bold text-warning"
			class:hidden={componentState !== 'submit-successful'}
		>
			<Fa icon={faCircleNotch}></Fa>
			<span>no results</span>
		</div>
	{/if}
</div>
