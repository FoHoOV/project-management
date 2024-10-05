<script lang="ts" module>
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import EnhancedForm from '$components/forms/EnhancedForm.svelte';

	import { schema } from './validators';
</script>

<script lang="ts">
	const { form } = $props();
</script>

<svelte:head>
	<title>login</title>
</svelte:head>

<EnhancedForm
	enhancerConfig={{ validator: { schema }, form: form }}
	showResetButton={false}
	formWrapperClasses="card flex w-full flex-row items-start justify-center bg-base-300 shadow-md"
	inputsWrapperClasses="card-body w-full items-center text-center md:flex-shrink-0 md:flex-grow-0"
>
	{#snippet inputs({ formErrors })}
		<FormInput
			name="username"
			autocomplete="username"
			wrapperClasses="w-full"
			errors={formErrors?.errors?.username}
		/>
		<FormInput
			name="password"
			autocomplete="current-password"
			wrapperClasses="w-full"
			type="password"
			errors={formErrors?.errors?.password}
		/>
	{/snippet}

	{#snippet actions({ loading })}
		<LoadingButton class="btn-primary mt-4 flex-grow" text="login" {loading} type="submit" />
	{/snippet}

	{#snippet footer()}
		<span class="divider divider-vertical"></span>

		<a class="flex flex-col items-start self-start" href="/signup">
			<h5>Don't have an account yet?</h5>
			<span>create one here!</span>
		</a>
	{/snippet}
</EnhancedForm>
