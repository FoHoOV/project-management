<script context="module" lang="ts">
	import type {
		EnhanceOptions,
		StandardFormActionError,
		StandardFormActionNames,
		SubmitRedirectedEventType,
		SubmitSucceededEventType,
		ValidatorErrorsType
	} from '$lib';
	import { z } from 'zod';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import Alert from '$components/Alert.svelte';
	import { getFormErrors, superEnhance } from '$lib/actions/form';
	import { untrack } from 'svelte';
	import type { Snippet } from 'svelte';

	type ComponentStates = 'submitting' | 'submit-successful' | 'none';

	export type Events<
		TFormAction extends StandardFormActionError,
		TSchema extends z.ZodTypeAny,
		TKey extends StandardFormActionNames<TFormAction>
	> = {
		onSubmitSucceeded?: (
			event: SubmitSucceededEventType<TSchema, TFormAction, TKey>['detail']
		) => void;
		onRedirected?: (event: SubmitRedirectedEventType<TSchema>['detail']) => void;
		onClientSideValidationErrors?: (event: ValidatorErrorsType<TSchema>) => void;
	};

	export type Props<
		TFormAction extends StandardFormActionError,
		TSchema extends z.ZodTypeAny,
		TKey extends StandardFormActionNames<TFormAction>
	> = {
		action?: string;
		enhancerConfig: EnhanceOptions<TSchema, TFormAction, TKey>;
		actions: Snippet<[{ loading: boolean; reset: () => void }]>;
		inputs: Snippet<
			[{ formErrors: ReturnType<typeof getFormErrors<TFormAction>>; reset: () => void }]
		>;
		defaultActions?: Snippet<[{ reset: () => void }]>;
		footer?: Snippet;
		method?: 'post' | 'get';
		successfulMessage?: string;
		showResetButton?: boolean;
		formWrapperClasses?: string;
		inputsWrapperClasses?: string;
		actionsWrapperClasses?: string;
	} & Events<TFormAction, TSchema, TKey>;
</script>

<script
	lang="ts"
	generics="TFormAction extends StandardFormActionError, TSchema extends z.ZodTypeAny, TKey extends StandardFormActionNames<TFormAction> = never"
>
	const {
		action,
		enhancerConfig,
		successfulMessage = '',
		method = 'post',
		showResetButton = true,
		formWrapperClasses = '',
		inputsWrapperClasses = '',
		actionsWrapperClasses = '',
		onSubmitSucceeded,
		onClientSideValidationErrors,
		onRedirected,
		actions,
		inputs,
		footer
	} = $props<Props<TFormAction, TSchema, TKey>>();

	let formElement = $state<HTMLFormElement | null>(null);
	let componentState = $state<ComponentStates>('none');
	let formErrors = $state(getFormErrors(enhancerConfig.form));

	$effect(() => {
		enhancerConfig.form;
		untrack(() => {
			formErrors = getFormErrors(enhancerConfig.form);
		});
	});

	export function resetForm() {
		formElement?.reset();
		formErrors = { errors: undefined, message: undefined };
		componentState = 'none';
	}

	export function formState() {
		return componentState;
	}
</script>

<form
	{action}
	use:superEnhance={enhancerConfig}
	on:submitclienterror={(e) => {
		formErrors = {
			errors: e.detail as any,
			message: 'Invalid form, please review your inputs'
		};
		componentState = 'none';
		onClientSideValidationErrors?.(e.detail);
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
		onSubmitSucceeded?.(e.detail);
	}}
	on:submitredirected={async (e) => {
		onRedirected?.(e.detail);
	}}
	bind:this={formElement}
	{method}
	class="w-full {formWrapperClasses}"
>
	<div class="flex flex-col gap-2 {inputsWrapperClasses}">
		<Alert
			class="mb-1"
			type="success"
			message={componentState == 'submit-successful' ? successfulMessage : ''}
		/>
		<Alert class="mb-1" type="error" message={formErrors?.message} />
		{@render inputs({ formErrors: formErrors, reset: resetForm })}
		<div class="mt-1 flex w-full flex-wrap items-start justify-end gap-2 {actionsWrapperClasses}">
			{#if showResetButton}
				<LoadingButton text="reset" class="btn-warning flex-1" type="button" on:click={resetForm} />
			{/if}

			{@render actions({ loading: componentState == 'submitting', reset: resetForm })}
		</div>

		{#if footer}
			{@render footer()}
		{/if}
	</div>
</form>
