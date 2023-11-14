<script lang="ts">
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import { getFormErrors, superEnhance } from '$lib/enhance/form';
	import Error from '$components/Error.svelte';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import type { ActionData } from './$types';
	import { schema } from './validators';

	export let form: ActionData;
	let isFormSubmitting: boolean = false;
	$: validationErrors = getFormErrors(form);
</script>

<svelte:head>
	<title>login</title>
</svelte:head>

<form
	method="post"
	use:superEnhance={{ validator: { schema } }}
	on:submitclienterror={(e) => {
		validationErrors = {
			errors: e.detail,
			message: 'Invalid form, please review your inputs'
		};
	}}
	on:submitstarted={() => {
		isFormSubmitting = true;
	}}
	on:submitended={() => {
		isFormSubmitting = false;
	}}
	class="card flex w-full flex-row items-start justify-center bg-base-300 shadow-md"
>
	<div class="card-body w-full items-center text-center md:flex-shrink-0 md:flex-grow-0">
		<Error message={validationErrors?.message} />

		<FormInput name="username" class="w-full" errors={validationErrors?.errors?.username} />
		<FormInput
			name="password"
			class="w-full"
			type="password"
			errors={validationErrors?.errors?.password}
		/>
		<div class="card-actions w-full justify-start">
			<LoadingButton
				class="btn-primary mt-4 flex-grow"
				text="login"
				loading={isFormSubmitting}
				type="submit"
			/>
		</div>

		<span class="divider divider-vertical" />

		<a class="flex flex-col items-start self-start" href="/signup">
			<h5>Don't have an account yet?</h5>
			<span>create one here!</span>
		</a>
	</div>
</form>
