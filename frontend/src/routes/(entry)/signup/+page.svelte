<script lang="ts">
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import { schema } from './validators';
	import EnhancedForm from '$components/forms/EnhancedForm.svelte';
	import { toasts } from '$lib/stores/toasts';

	const { form } = $props();
</script>

<svelte:head>
	<title>sign up</title>
</svelte:head>

<EnhancedForm
	enhancerConfig={{ validator: { schema }, form: form }}
	onRedirected={() => {
		toasts.addToast({ time: 5000, message: 'account successfully created', type: 'success' });
	}}
	showResetButton={false}
	formWrapperClasses="card flex w-full flex-row items-start justify-center bg-base-300 shadow-md"
	inputsWrapperClasses="card-body w-full items-center text-center md:flex-shrink-0 md:flex-grow-0"
>
	{#snippet inputs({ formErrors })}
		<FormInput
			name="username"
			autoComplete="username"
			wrapperClasses="w-full"
			errors={formErrors?.errors?.username}
		/>
		<FormInput
			name="password"
			autoComplete="new-password"
			wrapperClasses="w-full"
			type="password"
			errors={formErrors?.errors?.password}
		/>
		<FormInput
			name="confirm_password"
			autoComplete="new-password"
			label="confirm password"
			wrapperClasses="w-full"
			type="password"
			errors={formErrors?.errors?.confirm_password}
		/>
	{/snippet}

	{#snippet actions({ loading })}
		<LoadingButton class="btn-primary mt-4 flex-grow" text="signup" {loading} type="submit" />
	{/snippet}

	{#snippet footer()}
		<span class="divider divider-vertical" />

		<a class="flex flex-col items-start self-start" href="/login">
			<h5>Already have an account?</h5>
			<span>login here!</span>
		</a>
	{/snippet}
</EnhancedForm>
