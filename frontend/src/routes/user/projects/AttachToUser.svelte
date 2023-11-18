<script lang="ts">
	import type { ActionData } from './$types';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import Error from '$components/Error.svelte';
	import { getFormErrors, superEnhance } from '$lib/enhance/form';
	import { attachProjectSchema } from './validator';
	import { invalidate } from '$app/navigation';

	export let form: ActionData;
	export let projectId: number;

	let formElement: HTMLFormElement;

	$: formErrors = getFormErrors(form);
	let isAttachProjectSubmitting = false;

	function resetForm() {
		formElement.reset();
		formErrors = { errors: undefined, message: undefined };
	}
</script>

<form
	action="/user/projects?/attach"
	use:superEnhance={{
		validator: { schema: attachProjectSchema },
		form: form,
		action: 'attach'
	}}
	on:submitclienterror={(e) => {
		formErrors = {
			errors: e.detail,
			message: 'Invalid form, please review your inputs'
		};
	}}
	on:submitstarted={() => {
		isAttachProjectSubmitting = true;
	}}
	on:submitended={() => {
		isAttachProjectSubmitting = false;
	}}
	on:submitsucceeded={async (e) => {
		// based on docs and on how invalidate works this doesn't do shit
		await invalidate('/user/projects'); // TODO: use stores/ruins later
		resetForm();
	}}
	bind:this={formElement}
	method="post"
	class="card flex w-full flex-row items-start justify-center bg-base-300"
>
	<div class="card-body items-center text-center">
		<Error message={formErrors?.message} />
		<FormInput
			name="project_id"
			class="w-full"
			hideLabel={true}
			value={projectId}
			errors={''}
			type="hidden"
		/>
		<FormInput
			name="username"
			class="w-full"
			hideLabel={true}
			errors={formErrors?.errors?.username}
		/>
		<div class="card-actions w-full justify-end">
			<LoadingButton
				text="add"
				class="flex-auto"
				type="submit"
				loading={isAttachProjectSubmitting}
			/>
			<LoadingButton text="reset" class="btn-warning" type="button" on:click={resetForm} />
		</div>
	</div>
</form>
