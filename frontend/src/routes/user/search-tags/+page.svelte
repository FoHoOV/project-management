<script lang="ts">
	import LoadingButton from '$components/buttons/LoadingButton.svelte';
	import FormInput from '$components/forms/FormInput.svelte';
	import Alert from '$components/Alert.svelte';
	import type { TodoItem as TodoItemModel } from '$lib/generated-client/models';
	import { getFormErrors, superEnhance } from '$lib/actions/form';
	import { searchTagSchema } from '$routes/user/search-tags/validator';
	import type { PageData, ActionData } from './$types';
	import { onDestroy, onMount } from 'svelte';
	import todos from '$lib/stores/todos/todos';
	import TodoItem from '$components/todo/TodoItem.svelte';
	import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

	export let form: ActionData;

	let state: 'submitting' | 'submit-successful' | 'none' = 'none';

	let formElement: HTMLFormElement;

	$: formErrors = getFormErrors(form);

	function resetForm() {
		formElement.reset();
		formErrors = { errors: undefined, message: undefined };
		state = 'none';
	}

	function handleShowResults(result: TodoItemModel[]) {
		state = 'submit-successful';
		if (result.length == 0) {
			todos.clearTodoCategories();
			return;
		}
		todos.setTodoCategories([
			{
				id: -1,
				title: '',
				description: '',
				items: result.map((value) => {
					value.category_id = -1;
					value.order = null;
					return value;
				}),
				orders: [],
				projects: []
			}
		]);
	}

	onMount(() => {
		todos.setTodoCategories([]);
	});

	onDestroy(() => {
		todos.setTodoCategories([]);
	});
</script>

<form
	class="px-1"
	method="post"
	action="/user/search-tags?/search"
	use:superEnhance={{ form: form, action: 'search', validator: { schema: searchTagSchema } }}
	on:submitclienterror={(e) => {
		formErrors = {
			errors: e.detail,
			message: 'Invalid form, please review your inputs'
		};
		state = 'none';
	}}
	on:submitstarted={() => {
		state = 'none';
	}}
	on:submitended={() => {
		state = 'none';
	}}
	on:submitsucceeded={(event) => handleShowResults(event.detail.response)}
	bind:this={formElement}
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
			loading={state == 'submitting'}
		/>
		<LoadingButton text="reset" class="btn-warning flex-1" type="button" on:click={resetForm} />
	</div>
</form>

<div class="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
	{#if $todos.length > 0}
		{#each $todos[0].items as todo (todo.id)}
			<TodoItem {todo}></TodoItem>
		{/each}
	{:else}
		<div
			class="mt-5 flex items-center gap-2 text-lg font-bold text-warning"
			class:hidden={state !== 'submit-successful'}
		>
			<Fa icon={faCircleNotch}></Fa>
			<span>no results</span>
		</div>
	{/if}
</div>
