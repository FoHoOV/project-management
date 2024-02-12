<script context="module" lang="ts">
	export type Props = {
		form: ActionData;
		projectId?: number | undefined;
	};
</script>

<script lang="ts">
	import type { ActionData } from './$types';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import { attachProjectSchema } from './validator';
	import { invalidate } from '$app/navigation';
	import EnhancedForm from '$components/forms/EnhancedForm.svelte';

	const { form, projectId } = $props<Props>();
</script>

<EnhancedForm
	url="/user/projects?/attach"
	enhancerConfig={{
		validator: { schema: attachProjectSchema },
		form: form,
		action: 'attach'
	}}
	onSubmitSucceeded={async (response) => {
		await invalidate('/user/projects');
	}}
>
	{#snippet inputs({ formErrors })}
		<FormInput
			name="project_id"
			wrapperClasses="w-full"
			hideLabel={true}
			value={projectId}
			errors={''}
			type="hidden"
		/>
		<FormInput
			name="username"
			wrapperClasses="w-full"
			autoFocus={true}
			errors={formErrors?.errors?.username}
		/>
	{/snippet}

	{#snippet submitActions({ loading })}
		<LoadingButton text="share" class="btn-success flex-1" type="submit" {loading} />
	{/snippet}
</EnhancedForm>
