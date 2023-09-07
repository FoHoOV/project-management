<script lang="ts">
	import type { ActionData } from './$types';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import Error from '$components/Error.svelte';
	import { superEnhance, getFormErrors } from '$lib/enhance/form';
	import { schema } from './validators';

	export let form: ActionData;	
	let isFormSubmitting: boolean = false;
	$: validationErrors = getFormErrors(form);
</script>

<svelte:head>
	<title>sign up</title>
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
	on:submitstarted={() => (isFormSubmitting = true)}
	on:submitended={() => (isFormSubmitting = false)}
	class="flex items-start justify-center card bg-base-300 w-full flex-row"
>
	<div class="card-body items-center text-center md:flex-grow-0 md:flex-shrink-0 md:w-1/2">
		<Error message={validationErrors?.message} />
		<FormInput name="username" className="w-full" errors={validationErrors?.errors?.username} />
		<FormInput
			name="password"
			className="w-full"
			type="password"
			errors={validationErrors?.errors?.password}
		/>
		<FormInput
			name="confirm_password"
			label="confirm password"
			className="w-full"
			type="password"
			errors={validationErrors?.errors?.confirm_password}
		/>
		<div class="card-actions justify-start w-full">
			<LoadingButton
				className="btn-primary mt-4 flex-grow"
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
