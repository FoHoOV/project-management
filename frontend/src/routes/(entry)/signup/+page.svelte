<script lang="ts">
	import type { ActionData } from './$types';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import Error from '$components/Error.svelte';
	import { superEnhance, getFormErrors } from '$lib/enhance/form';
	import { schema } from './validators';

	export let form: ActionData;
	let isFormSubmitting: boolean = false;
	$: formErrors = getFormErrors(form);
</script>

<svelte:head>
	<title>sign up</title>
</svelte:head>

<form
	method="post"
	use:superEnhance={{ validator: { schema } }}
	on:submitclienterror={(e) => {
		formErrors = {
			errors: e.detail,
			message: 'Invalid form, please review your inputs'
		};
	}}
	on:submitstarted={() => (isFormSubmitting = true)}
	on:submitended={() => (isFormSubmitting = false)}
	class="card flex w-full flex-row items-start justify-center bg-base-300 shadow-md"
>
	<div class="card-body w-full items-center text-center md:flex-shrink-0 md:flex-grow-0">
		<Error message={formErrors?.message} />
		<FormInput name="username" class="w-full" errors={formErrors?.errors?.username} />
		<FormInput
			name="password"
			class="w-full"
			type="password"
			errors={formErrors?.errors?.password}
		/>
		<FormInput
			name="confirm_password"
			label="confirm password"
			class="w-full"
			type="password"
			errors={formErrors?.errors?.confirm_password}
		/>
		<div class="card-actions w-full justify-start">
			<LoadingButton
				class="btn-primary mt-4 flex-grow"
				text="signup"
				loading={isFormSubmitting}
				type="submit"
			/>
		</div>

		<span class="divider divider-vertical" />

		<a class="flex flex-col items-start self-start" href="/login">
			<h5>Already have an account?</h5>
			<span>login here!</span>
		</a>
	</div>
</form>
