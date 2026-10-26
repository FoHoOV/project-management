import type { Attachment } from 'svelte/attachments';
import { enhance, type SubmitFunction } from '$app/forms';
import type { z } from 'zod';
import type { EnhanceOptions, FormActionResultType, SubmitCallbacks } from './submit-types';
import { getClientSideFormErrors } from './validator';
import {
	convertFormDataToObject,
	getFormErrors,
	type StandardFormActionError,
	type StandardFormActionNames
} from './utils';

type SuperEnhanceOptions<
	TSchema extends z.ZodType,
	TFormAction extends StandardFormActionError,
	TKey extends StandardFormActionNames<TFormAction> = never
> = EnhanceOptions<TSchema, TFormAction, TKey> & SubmitCallbacks<TSchema, TFormAction, TKey>;

export function superEnhance(
	options?: Pick<SubmitCallbacks<never, never, never>, 'onSubmitStarted' | 'onSubmitEnded'>
): Attachment<HTMLFormElement>;
export function superEnhance<
	TSchema extends z.ZodType,
	TFormAction extends StandardFormActionError,
	TKey extends StandardFormActionNames<TFormAction> = never
>(options: SuperEnhanceOptions<TSchema, TFormAction, TKey>): Attachment<HTMLFormElement>;
export function superEnhance<
	TSchema extends z.ZodType,
	TFormAction extends StandardFormActionError = never,
	TKey extends StandardFormActionNames<TFormAction> = never
>(options?: Partial<SuperEnhanceOptions<TSchema, TFormAction, TKey>>): Attachment<HTMLFormElement> {
	return (node) => {
		if (options?.actionName && !node.action.endsWith(`?/${options.actionName.toString()}`)) {
			throw new Error('form.action should end with the passed action in enhancer options');
		}

		const submit =
			options?.submit ?? _defaultSubmitHandler<TSchema, TFormAction, TKey>(node, options);

		const handleSubmit: SubmitFunction = async (input) => {
			if (options?.validator) {
				const errors = await getClientSideFormErrors<TSchema>(
					input.formData,
					options.validator.schema
				);

				if (Object.keys(errors).length > 0) {
					input.cancel();
					options.onClientSideValidationErrors?.(errors);
					options.onSubmitFailed?.({
						error: {
							errors: errors as any,
							message: 'Invalid form, please review your inputs'
						},
						formData: convertFormDataToObject(input.formData)
					});
					return;
				}
			}

			return submit(input);
		};

		const enhancer = enhance(node, handleSubmit);
		node.addEventListener('reset', _superResetHandler);

		return () => {
			enhancer.destroy();
			node.removeEventListener('reset', _superResetHandler);
		};
	};
}

function _defaultSubmitHandler<
	TSchema extends z.ZodType,
	TFormAction extends StandardFormActionError,
	TKey extends StandardFormActionNames<TFormAction> = never
>(
	node: HTMLFormElement,
	options?: Partial<SuperEnhanceOptions<TSchema, TFormAction, TKey>>
): SubmitFunction {
	return ({ formData }) => {
		options?.onSubmitStarted?.();

		return async ({ update, result }) => {
			options?.onSubmitEnded?.();
			_focusOnFirstVisibleInput(node);

			if (result.type == 'success') {
				const parsedFormData = await options?.validator?.schema.safeParseAsync(
					convertFormDataToObject(formData)
				);

				if (parsedFormData && !parsedFormData?.success) {
					throw new Error(
						"for some reason server-side validations succeeded but the client-side validations didn't, OR the client data changed since the form has been submitted"
					);
				}

				options?.onSubmitSucceeded?.({
					response: _getResultFromFormAction(result.data, options),
					formData: convertFormDataToObject(formData),
					parsedFormData: parsedFormData?.data as z.infer<TSchema>
				});
			} else if (result.type == 'redirect') {
				options?.onRedirected?.({
					redirectUrl: result.location.startsWith('/')
						? new URL(location.origin + result.location)
						: new URL(result.location),
					formData: convertFormDataToObject(formData)
				});
			} else if (result.type == 'error') {
				options?.onSubmitFailed?.({
					error: getFormErrors(result),
					formData: convertFormDataToObject(formData)
				});
			} else if (result.type == 'failure') {
				options?.onSubmitFailed?.({
					error: getFormErrors(result.data as any),
					formData: convertFormDataToObject(formData)
				});
			}

			await update({
				reset: options?.resetOnSubmit,
				refreshAll: result.type === 'success' && (options?.refreshAllAfterSubmit ?? true),
				// The results are handled through the callbacks, so stay on the current page even when
				// the action belongs to another route.
				navigate: false
			});
		};
	};
}

function _getResultFromFormAction<
	TSchema extends z.ZodType,
	TFormAction extends StandardFormActionError,
	TKey extends StandardFormActionNames<TFormAction> = never
>(
	data: Record<string, any> | undefined,
	options: Partial<EnhanceOptions<TSchema, TFormAction, TKey>> | undefined
): FormActionResultType<TFormAction, TKey> {
	if (!data) {
		throw new Error("form action didn't return anything which is an unexpected behavior");
	}

	if (!options || !options.actionName) {
		return data['response'];
	}

	return data[options.actionName as string]['response'];
}

function _superResetHandler(event: Event) {
	const node = event.target as HTMLFormElement;
	_focusOnFirstVisibleInput(node);
}

function _focusOnFirstVisibleInput(node: HTMLFormElement) {
	node.querySelector<HTMLInputElement>("input:not([type='hidden'])")?.focus();
}
