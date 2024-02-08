<script context="module" lang="ts">
	export type Props = {
		form: ActionData;
	};
</script>

<script lang="ts">
	import type { ActionData } from './$types';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import Alert from '$components/Alert.svelte';
	import { getFormErrors, superEnhance } from '$lib/actions/form';
	import { todoCategories } from '$lib/stores/todos';
	import { createTodoCategorySchema } from './validator';
	import { page } from '$app/stores';
	import { generateTodoListUrl } from '$lib/utils/params/route';
	import { untrack } from 'svelte';

	const { form } = $props<Props>();

	let formElement = $state<HTMLFormElement | null>(null);
	let componentState = $state<'submitting' | 'submit-successful' | 'none'>('none');

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
</script>

<form
	action="{generateTodoListUrl($page.params.project_name, $page.params.project_id)}?/createCategory"
	use:superEnhance={{
		validator: { schema: createTodoCategorySchema },
		form: form,
		action: 'createCategory'
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
	}}
	on:submitsucceeded={(e) => {
		todoCategories.addCategory(e.detail.response);
		resetForm();
		componentState = 'submit-successful';
	}}
	bind:this={formElement}
	method="post"
	class="w-full"
>
	<div class="flex flex-col gap-2">
		<Alert
			class="mb-1"
			type="success"
			message={componentState == 'submit-successful' ? 'category created!' : ''}
		/>
		<Alert class="mb-1" type="error" message={formErrors?.message} />
		<FormInput
			wrapperClasses="hidden"
			type="hidden"
			name="project_id"
			value={$page.params.project_id}
			errors={''}
		/>
		<FormInput
			name="title"
			autoFocus={true}
			wrapperClasses="w-full"
			errors={formErrors?.errors?.title}
		/>
		<FormInput
			name="description"
			label="description (Optional)"
			wrapperClasses="w-full"
			errors={formErrors?.errors?.description}
		/>
		<div class="card-actions mt-1 w-full justify-end">
			<LoadingButton text="reset" class="btn-warning flex-1" type="button" on:click={resetForm} />
			<LoadingButton
				text="create"
				class="btn-success flex-1"
				type="submit"
				loading={componentState == 'submitting'}
			/>
		</div>
	</div>
</form>
