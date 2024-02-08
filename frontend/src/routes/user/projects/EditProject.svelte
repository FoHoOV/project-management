<script context="module" lang="ts">
	export type Props = {
		form: ActionData;
		project: Project;
	};
</script>

<script lang="ts">
	import type { ActionData } from './$types';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import Alert from '$components/Alert.svelte';
	import { getFormErrors, superEnhance } from '$lib/actions/form';
	import type { Project } from '$lib/generated-client/models';
	import { editProjectSchema } from './validator';
	import { projects } from '$lib/stores/projects';
	import { untrack } from 'svelte';

	const { form, project } = $props<Props>();

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
	action="/user/projects?/edit"
	use:superEnhance={{
		validator: { schema: editProjectSchema },
		form: form,
		action: 'edit'
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
		projects.update(e.detail.response);
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
			message={componentState == 'submit-successful' ? 'project info updated!' : ''}
		/>
		<Alert class="mb-1" type="error" message={formErrors?.message} />
		<FormInput class="hidden" type="hidden" name="project_id" value={project.id} errors={''} />
		<FormInput
			name="title"
			autoFocus={true}
			class="w-full"
			value={project.title}
			errors={formErrors?.errors?.title}
		/>
		<FormInput
			name="description"
			label="description (Optional)"
			class="w-full"
			value={project.description}
			errors={formErrors?.errors?.description}
		/>
		<div class="card-actions mt-1 w-full justify-end">
			<LoadingButton text="reset" class="btn-warning flex-1" type="button" on:click={resetForm} />
			<LoadingButton
				text="edit"
				class="btn-success flex-1"
				type="submit"
				loading={componentState === 'submitting'}
			/>
		</div>
	</div>
</form>
