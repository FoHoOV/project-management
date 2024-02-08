<script context="module" lang="ts">
	export type Props = {
		form: ActionData;
		tag: TodoItemPartialTag;
	};
</script>

<script lang="ts">
	import type { ActionData } from './$types';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import Alert from '$components/Alert.svelte';
	import { getFormErrors, superEnhance } from '$lib/actions/form';
	import { editTagSchema } from './validator';
	import { page } from '$app/stores';
	import type { TodoItemPartialTag } from '$lib/generated-client/models';
	import { generateTodoListUrl } from '$lib/utils/params/route';
	import { todoCategories } from '$lib/stores/todos';
	import { untrack } from 'svelte';

	const { form, tag } = $props<Props>();

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
	action="{generateTodoListUrl($page.params.project_name, $page.params.project_id)}?/editTag"
	use:superEnhance={{
		validator: { schema: editTagSchema },
		form: form,
		action: 'editTag'
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
	on:submitsucceeded={async (e) => {
		todoCategories.updateTag(e.detail.response);
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
			message={componentState == 'submit-successful' ? 'tag edited!' : ''}
		/>
		<Alert class="mb-1" type="error" message={formErrors?.message} />
		<FormInput wrapperClasses="hidden" type="hidden" name="id" value={tag.id} errors={''} />
		<FormInput
			name="name"
			type="text"
			autoFocus={true}
			wrapperClasses="w-full"
			value={tag.name}
			errors={formErrors?.errors?.message}
		/>
		<div class="card-actions mt-1 w-full justify-end">
			<LoadingButton text="reset" class="btn-warning flex-1" type="button" on:click={resetForm} />
			<LoadingButton
				text="edit"
				class="btn-success flex-1"
				type="submit"
				loading={componentState == 'submitting'}
			/>
		</div>
	</div>
</form>
