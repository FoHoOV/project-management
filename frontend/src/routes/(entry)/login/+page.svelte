<script lang="ts">
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import { schema } from './validators';
	import EnhancedForm from '$components/forms/EnhancedForm.svelte';

	const { form } = $props();
</script>

<svelte:head>
	<title>login</title>
</svelte:head>

<EnhancedForm enhancerConfig={{ validator: { schema }, form: form }} showResetButton={false}>
	{#snippet inputs({ formErrors })}
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
	{/snippet}

	{#snippet submitActions({ loading })}
		<LoadingButton class="btn-primary mt-4 flex-grow" text="login" {loading} type="submit" />
	{/snippet}

	{#snippet footer()}
		<span class="divider divider-vertical" />

		<a class="flex flex-col items-start self-start" href="/signup">
			<h5>Don't have an account yet?</h5>
			<span>create one here!</span>
		</a>
	{/snippet}
</EnhancedForm>
