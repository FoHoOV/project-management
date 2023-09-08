<script lang="ts">
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import TodoList from '$lib/components/todo/TodoList.svelte';
	import Error from '$components/Error.svelte';
	import { getFormErrors, superEnhance } from '$lib/enhance/form';
	import type { ActionData, PageData } from './$types';
	import todoCategories from '$lib/stores/todo-categories';
	import { schema } from './validator';

	export let data: PageData;
	export let form: ActionData;
	export let formElement: HTMLFormElement;
	$: createTodoFormErrors = getFormErrors(form);
	let isCreateTodoCategorySubmitting = false;

	async function resolveTodoCategories() {
		const fetchedTodos = await data.streamed.todos;
		if (fetchedTodos.success) {
			todoCategories.setTodoCategories(fetchedTodos.result);
		} else {
			createTodoFormErrors.message = fetchedTodos.error.body.message;
		}
	}
</script>

<svelte:head>
	<title>todos</title>
</svelte:head>
<form
	action="?/createCategory"
	use:superEnhance={{ validator: { schema }, form: form }}
	on:submitclienterror={(e) => {
		createTodoFormErrors = {
			errors: e.detail,
			message: 'Invalid form, please review your inputs'
		};
	}}
	on:submitstarted={() => {
		isCreateTodoCategorySubmitting = true;
	}}
	on:submitstarted={() => {
		isCreateTodoCategorySubmitting = false;
	}}
	on:submitsucceeded={(e) => {
		todoCategories.addCategory(e.detail.response);
	}}
	bind:this={formElement}
	method="post"
	class="flex items-start justify-center card bg-base-300 w-full flex-row"
>
	<div class="card-body items-center text-center md:flex-grow-0 md:flex-shrink-0 md:w-1/2">
		<Error message={createTodoFormErrors?.message} />
		<FormInput className="hidden" type="checkbox" name="is_done" value={false} errors={''} />
		<FormInput
			name="title"
			className="w-full"
			hideLabel={true}
			errors={createTodoFormErrors?.errors?.title}
		/>
		<FormInput
			name="description"
			className="w-full"
			hideLabel={true}
			errors={createTodoFormErrors?.errors?.description}
		/>
		<div class="card-actions justify-end w-full">
			<LoadingButton
				text="add"
				className="flex-auto"
				type="submit"
				loading={isCreateTodoCategorySubmitting}
			/>
			<LoadingButton
				text="reset"
				className="btn-warning"
				type="button"
				on:click={() => {
					formElement.reset();
					createTodoFormErrors = { errors: undefined, message: undefined };
				}}
			/>
		</div>
	</div>
</form>

<div class="divider" />

<!-- or stream the data from load function !-->
{#await resolveTodoCategories()}
	<span class="loading loading-ring m-auto block" />
{:then}
	<div class="grid grid-cols-2 center gap-2">
		{#each $todoCategories as category}
			<div>
				<TodoList {category} done={false} />
			</div>
		{/each}
	</div>
{:catch error}
	<Error message={error.message} />
{/await}
