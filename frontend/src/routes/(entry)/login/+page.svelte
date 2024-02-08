<script lang="ts">
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import { getFormErrors, superEnhance } from '$lib/actions/form';
	import Alert from '$components/Alert.svelte';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import { schema } from './validators';
	import { untrack } from 'svelte';

	const { form } = $props();

	let componentState = $state<'none' | 'submitting'>('none');
	let formErrors = $state(getFormErrors(form));

	$effect(() => {
		form;
		untrack(() => {
			formErrors = getFormErrors(form);
		});
	});
</script>

<svelte:head>
	<title>login</title>
</svelte:head>

<form
	method="post"
	use:superEnhance={{ validator: { schema } }}
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
	class="card flex w-full flex-row items-start justify-center bg-base-300 shadow-md"
>
	<div class="card-body w-full items-center text-center md:flex-shrink-0 md:flex-grow-0">
		<Alert type="error" message={formErrors?.message} />

		<FormInput
			name="username"
			autoComplete="username"
			wrapperClasses="w-full"
			errors={formErrors?.errors?.username}
		/>
		<FormInput
			name="password"
			autoComplete="current-password"
			wrapperClasses="w-full"
			type="password"
			errors={formErrors?.errors?.password}
		/>
		<div class="card-actions w-full justify-start">
			<LoadingButton
				class="btn-primary mt-4 flex-grow"
				text="login"
				loading={componentState === 'submitting'}
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
