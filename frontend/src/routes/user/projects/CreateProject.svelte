<script context="module" lang="ts">
	export type Props = {
		form: ActionData;
	};
</script>

<script lang="ts">
	import type { ActionData } from './$types';
	import FormInput from '$lib/components/forms/FormInput.svelte';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import { createProjectSchema } from './validator';
	import EnhancedForm from '$components/forms/EnhancedForm.svelte';
	import { projects } from '$lib/stores/projects';

	const { form } = $props<Props>();
</script>

<EnhancedForm
	action="/user/projects?/create"
	enhancerConfig={{
		validator: { schema: createProjectSchema },
		form: form,
		action: 'create'
	}}
	onSubmitSucceeded={async (event) => {
		projects.add(event.response);
	}}
>
	{#snippet inputs({ formErrors })}
		<FormInput
			name="title"
			wrapperClasses="w-full"
			autoFocus={true}
			errors={formErrors?.errors?.title}
		/>
		<FormInput
			name="description"
			label="description (Optional)"
			wrapperClasses="w-full"
			errors={formErrors?.errors?.description}
		/>
		<FormInput
			name="create_from_default_template"
			label="Create from default template?"
			type="checkbox"
			value={true}
			wrapperClasses="w-full !flex-row items-center !justify-start gap-3"
			inputClasses="!checkbox !btn-square !checkbox-success"
			errors={formErrors.errors?.create_from_default_template?.toString()}
		/>
	{/snippet}

	{#snippet submitActions({ loading })}
		<LoadingButton text="create" class="btn-success flex-1" type="submit" {loading} />
	{/snippet}
</EnhancedForm>
