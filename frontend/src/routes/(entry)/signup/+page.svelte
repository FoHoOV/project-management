<script lang="ts">
	import type { ActionData } from './$types';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import Alert from '$components/Alert.svelte';
	import { superEnhance, getFormErrors } from '$lib/actions/form';
	import toasts from '$lib/stores/toasts';
	import { schema } from './validators';

	export let form: ActionData;
	let state: 'none' | 'submitting' = 'none';
	$: formErrors = getFormErrors(form);
</script>

<svelte:head>
	<title>sign up</title>
</svelte:head>

<form
	method="post"
	use:superEnhance={{ validator: { schema }, form: form }}
	on:submitclienterror={(e) => {
		formErrors = {
			errors: e.detail,
			message: 'Invalid form, please review your inputs'
		};
		state = 'none';
	}}
	on:submitstarted={() => (state = 'submitting')}
	on:submitended={() => (state = 'none')}
	on:submitredirected={() => {
		toasts.addToast({ time: 5000, message: 'account successfully created', type: 'success' });
	}}
	class="card flex w-full flex-row items-start justify-center bg-base-300 shadow-md"
>
	<div class="card-body w-full items-center text-center md:flex-shrink-0 md:flex-grow-0">
		<Alert type="error" message={formErrors?.message} />
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
				loading={state === 'submitting'}
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
