<script lang="ts">
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import TodoList from '$lib/components/todo/TodoList.svelte';
	import Error from '$components/Error.svelte';
	import { getFormErrors, superEnhance } from '$lib/enhance/form';
	import type { ActionData, PageData } from './$types';
	import todos from '$lib/stores/todos';
	import { schema } from './validator';
	import { TodoClient } from '$lib/client-wrapper/clients';
	import { callServiceInClient } from '$lib/client-wrapper/wrapper.client';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

	export let form: ActionData;
	export let formElement: HTMLFormElement;
	$: createTodoFormErrors = getFormErrors(form);
	let isCreateTodosSubmitting = false;

	// this doesn't work see page.server function comments on this
	// async function resolveTodos() {
	// 	const fetchedTodos = await data.streamed.todos;
	// 	if (fetchedTodos.success) {
	// 		todos.setTodos(fetchedTodos.result);
	// 	} else {
	// 		createTodoFormErrors.message = fetchedTodos.error.message;
	// 	}
	// }

	async function fetchTodos() {
		const fetchedTodos = await callServiceInClient({
			serviceCall: async () => {
				return await TodoClient({ token: $page.data.token }).getForUser('all');
			}
		});

		if (fetchedTodos.success) {
			todos.setTodos(fetchedTodos.result);
		} else {
			Promise.reject({ message: fetchedTodos.error.message });
		}
	}
</script>

<svelte:head>
	<title>todos</title>
</svelte:head>
<pre>
	{JSON.stringify(form)}
</pre>
<form
	use:superEnhance={{ validator: { schema }, form: form }}
	on:submitclienterror={(e) => {
		createTodoFormErrors = {
			errors: e.detail,
			message: 'Invalid form, please review your inputs'
		};
	}}
	on:submitstarted={() => {
		isCreateTodosSubmitting = true;
	}}
	on:submitstarted={() => {
		isCreateTodosSubmitting = false;
	}}
	on:submitsucceeded={(e) => {
		todos.addTodo(e.detail.response);
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
				loading={isCreateTodosSubmitting}
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

<!-- we should not call await without <if browser> here because server-side rendering will not wait for this to finish-->
<!-- {#if browser}
	{#await fetchTodos()}
		<span class="loading loading-ring m-auto block" />
	{:then}
		<div class="grid grid-cols-2 center gap-2">
			<div>
				<TodoList todos={$todos} done={false} />
			</div>
			<div>
				<TodoList todos={$todos} done={true} />
			</div>
		</div>
	{:catch error}
		<Error message={error.message} />
	{/await}
{/if} -->

<!-- or stream  the data from load function, which cannot be done if the request throws an error (see this  page's server load function for more info)-->
{#if browser}
	{#await fetchTodos()}
		<span class="loading loading-ring m-auto block" />
	{:then}
		<div class="grid grid-cols-2 center gap-2">
			<div>
				<TodoList todos={$todos} done={false} />
			</div>
			<div>
				<TodoList todos={$todos} done={true} />
			</div>
		</div>
	{:catch error}
		<Error message={error.message} />
	{/await}
{/if}
