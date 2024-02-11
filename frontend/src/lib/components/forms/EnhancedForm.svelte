<script context="module" lang="ts">
	import type { EnhanceOptions, ErrorMessage, FormActionResultType } from '$lib';

	import { z } from 'zod';

	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import Alert from '$components/Alert.svelte';
	import { getFormErrors, superEnhance } from '$lib/actions/form';
	import { untrack } from 'svelte';
	import type { Snippet } from 'svelte';

	export type Events<
		TFormAction extends { error?: any | undefined; message?: ErrorMessage | undefined } | null,
		TSchema extends z.ZodTypeAny,
		TKey extends keyof NonNullable<TFormAction> = never
	> = {
		onSubmitSucceeded?: (response: FormActionResultType<TFormAction, TKey>) => void;
		onValidationErrors?: () => void;
	};

	export type Props<
		TFormAction extends { error?: any | undefined; message?: ErrorMessage | undefined } | null,
		TSchema extends z.ZodTypeAny,
		TKey extends keyof NonNullable<TFormAction> = never
	> = {
		url: string;
		enhancerConfig: EnhanceOptions<TSchema, TFormAction, TKey>;
		method: 'post' | 'get';
		successfulMessage: string;
		submitActions: Snippet<[{ loading: boolean }]>;
		defaultActions: Snippet;
		inputs: Snippet<[{ formErrors: ReturnType<typeof getFormErrors<TFormAction>> }]>;
	} & Events<TFormAction, TSchema, TKey>;
</script>

<script
	lang="ts"
	generics="TFormAction extends { error?: any | undefined; message?: ErrorMessage | undefined } | null, TSchema extends z.ZodTypeAny"
>
	const {
		url,
		enhancerConfig,
		successfulMessage = 'request submitted!',
		method = 'post',
		onSubmitSucceeded,
		onValidationErrors,
		submitActions,
		defaultActions,
		inputs
	} = $props<Props<TFormAction, TSchema>>();

	let formElement = $state<HTMLFormElement | null>(null);
	let componentState = $state<'submitting' | 'submit-successful' | 'none'>('none');
	let formErrors = $state(getFormErrors(enhancerConfig.form));

	$effect(() => {
		enhancerConfig.form;
		untrack(() => {
			formErrors = getFormErrors(enhancerConfig.form);
		});
	});

	function resetForm() {
		formElement?.reset();
		formErrors = { errors: undefined, message: undefined };
		componentState = 'none';
	}
</script>

<form
	action={url}
	use:superEnhance={enhancerConfig}
	on:submitclienterror={(e) => {
		formErrors = {
			errors: e.detail,
			message: 'Invalid form, please review your inputs'
		};
		componentState = 'none';
		onValidationErrors?.();
	}}
	on:submitstarted={() => {
		componentState = 'submitting';
	}}
	on:submitended={() => {
		componentState = 'none';
	}}
	on:submitsucceeded={async (e) => {
		resetForm();
		componentState = 'submit-successful';
		onSubmitSucceeded?.(e.detail.response);
	}}
	bind:this={formElement}
	{method}
	class="w-full"
>
	<div class="flex flex-col gap-2">
		<Alert
			class="mb-1"
			type="success"
			message={componentState == 'submit-successful' ? successfulMessage : ''}
		/>
		<Alert class="mb-1" type="error" message={formErrors?.message} />
		{@render inputs({ formErrors: formErrors })}
		<div class="mt-1 flex w-full flex-wrap items-start justify-end gap-2">
			<LoadingButton text="reset" class="btn-warning flex-1" type="button" on:click={resetForm} />
			{#if defaultActions}
				{@render defaultActions()}
			{/if}
			{@render submitActions({ loading: componentState == 'submitting' })}
		</div>
	</div>
</form>
