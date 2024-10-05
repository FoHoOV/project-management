<script lang="ts" module>
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import Alert from '$components/alerts/Alert.svelte';

	import {
		type EnhanceOptions,
		type StandardFormActionError,
		type StandardFormActionNames,
		type SubmitFailedEventType,
		type SubmitRedirectedEventType,
		type SubmitStartEventType,
		type SubmitSucceededEventType,
		type ValidatorErrorsType
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

	export function resetForm(force: boolean = false) {
		(force || enhancerConfig.resetOnSubmit === true) && formElement?.reset();
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
	onsubmitclienterror={(e) => {
		onClientSideValidationErrors?.(e.detail.errors);
	}}
	onsubmitstarted={(e) => {
		componentState = 'submitting';
		onSubmitStarted?.(e.detail);
	}}
	onsubmitended={() => {
		componentState = 'none';
	}}
	onsubmitsucceeded={async (e) => {
		resetForm();
		componentState = 'submit-successful';
		onSubmitSucceeded?.(e.detail);
	}}
	onsubmitredirected={async (e) => {
		onRedirected?.(e.detail);
	}}
	onsubmitfailed={async (e) => {
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
			message={componentState == 'submit-successful' ? new String(successfulMessage) : null}
		/>
		<Alert
			class="mb-1"
			type="error"
			message={showErrors ? new String(formErrors?.message) : null}
		/>

		{@render inputs({
			formErrors: formErrors,
			reset: () => {
				resetForm(true);
			}
		})}
		<div class="mt-1 flex w-full flex-wrap items-start justify-end gap-2 {actionsWrapperClasses}">
			{#if showResetButton}
				<LoadingButton
					text="reset"
					class="btn-warning flex-1"
					type="button"
					onclick={() => {
						resetForm(true);
					}}
				/>
			{/if}

			{@render actions({
				loading: componentState == 'submitting',
				reset: () => {
					resetForm(true);
				}
			})}
		</div>

		{@render footer?.()}
	</div>
</form>
