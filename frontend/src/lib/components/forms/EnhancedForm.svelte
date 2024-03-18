<script lang="ts" context="module">
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import Alert from '$components/Alert.svelte';

	import type {
		EnhanceOptions,
		StandardFormActionError,
		StandardFormActionNames,
		SubmitFailedEventType,
		SubmitRedirectedEventType,
		SubmitStartEventType,
		SubmitSucceededEventType,
		ValidatorErrorsType
	} from '$lib';
	import { z } from 'zod';
	import { getFormErrors, superEnhance } from '$lib/actions/form';
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
		/**
		 * called on both client-side and server-side errors
		 */
		onSubmitFailed?: (event: SubmitFailedEventType<TFormAction>['detail']) => void;
		onSubmitStarted?: (event: SubmitStartEventType['detail']) => void;
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
			[{ formErrors: ReturnType<typeof getFormErrors<TFormAction>> | undefined; reset: () => void }]
		>;
		defaultActions?: Snippet<[{ reset: () => void }]>;
		footer?: Snippet;
		method?: 'post' | 'get';
		showErrors?: boolean;
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
		showErrors = true,
		showResetButton = true,
		formWrapperClasses = '',
		inputsWrapperClasses = '',
		actionsWrapperClasses = '',
		onSubmitSucceeded,
		onSubmitFailed,
		onSubmitStarted,
		onClientSideValidationErrors,
		onRedirected,
		actions,
		inputs,
		footer
	}: Props<TFormAction, TSchema, TKey> = $props();

	let formElement = $state<HTMLFormElement | null>(null);
	let componentState = $state<ComponentStates>('none');
	let formErrors = $state<ReturnType<typeof getFormErrors<TFormAction>>>();

	export function resetForm() {
		enhancerConfig.resetOnSubmit !== false && formElement?.reset();
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
		onClientSideValidationErrors?.(e.detail.errors);
	}}
	on:submitstarted={(e) => {
		componentState = 'submitting';
		onSubmitStarted?.(e.detail);
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
	on:submitfailed={async (e) => {
		componentState = 'none';
		formErrors = e.detail.error;
		onSubmitFailed?.(e.detail);
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
		<Alert class="mb-1" type="error" message={showErrors ? formErrors?.message : null} />

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
