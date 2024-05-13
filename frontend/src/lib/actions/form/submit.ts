import type { ActionReturn } from 'svelte/action';
import type { SubmitFunction } from '@sveltejs/kit';
import { applyAction, enhance } from '$app/forms';

import type { z } from 'zod';
import type {
	SubmitEvents,
	EnhanceOptions,
	FormActionResultType,
	SubmitRedirectedEventType,
	SubmitStartEventType,
	SubmitEndedEventType,
	SubmitSucceededEventType,
	SubmitFailedEventType
} from './submit-types';
import { validate } from './validator';
import type { SubmitClientErrorEventType, ValidatorErrorEvents } from './validator-types';
import {
	convertFormDataToObject,
	getFormErrors,
	type StandardFormActionError,
	type StandardFormActionNames
} from './utils';
import { invalidateAll } from '$app/navigation';

export function superEnhance(
	node: HTMLFormElement
): ActionReturn<
	undefined,
	Pick<SubmitEvents<never, never, never>, 'onsubmitstarted' | 'onsubmitended'>
>;
export function superEnhance<
	TSchema extends z.ZodTypeAny,
	TFormAction extends StandardFormActionError,
	TKey extends StandardFormActionNames<TFormAction> = never
>(
	node: HTMLFormElement,
	options: EnhanceOptions<TSchema, TFormAction, TKey>
): ActionReturn<
	EnhanceOptions<TSchema, TFormAction, TKey>,
	ValidatorErrorEvents<TSchema> & SubmitEvents<TSchema, TFormAction, TKey>
>;
export function superEnhance<
	TSchema extends z.ZodTypeAny,
	TFormAction extends StandardFormActionError = never,
	TKey extends StandardFormActionNames<TFormAction> = never
>(node: HTMLFormElement, options?: Partial<EnhanceOptions<TSchema, TFormAction, TKey>>) {
	if (options?.actionName && !node.action.endsWith(`?/${options.actionName.toString()}`)) {
		throw new Error('form.action should end with the passed action in enhancer options');
	}

	const handleSubmit =
		options?.submit ?? _defaultSubmitHandler<TSchema, TFormAction, TKey>(node, options);

	const validator = options?.validator && validate(node, options.validator);
	const enhancer = enhance(node, handleSubmit);
	node.addEventListener('reset', _superResetHandler);

	function _handleClientSideError(event: Event) {
		_fireSubmitFailureForClientSideError(node, event as SubmitClientErrorEventType<TSchema>);
	}

	node.addEventListener('submitclienterror', _handleClientSideError);

	return {
		destroy() {
			validator?.destroy && validator.destroy();
			enhancer.destroy();
			node.removeEventListener('reset', _superResetHandler);
			node.removeEventListener('submitclienterror', _handleClientSideError);
		}
	};
}

function _defaultSubmitHandler<
	TSchema extends z.ZodTypeAny,
	TFormAction extends StandardFormActionError,
	TKey extends StandardFormActionNames<TFormAction> = never
>(
	node: HTMLFormElement,
	options?: Partial<EnhanceOptions<TSchema, TFormAction, TKey>>
): SubmitFunction {
	return ({ formData }) => {
		node.dispatchEvent(new CustomEvent('submitstarted') satisfies SubmitStartEventType);

		return async ({ update, result }) => {
			node.dispatchEvent(new CustomEvent('submitended') satisfies SubmitEndedEventType);
			_focusOnFirstVisibleInput(node);

			if (result.type == 'success') {
				console.debug('s-form-result');
				console.debug(_getResultFromFormAction(result.data, options));
				console.debug('e-form-result');

				const parsedFormData = await options?.validator?.schema.safeParseAsync(
					convertFormDataToObject(formData)
				);

				if (parsedFormData && !parsedFormData?.success) {
					throw new Error(
						"for some reason server-side validations succeeded but the client-side validations didn't, OR the client data changed since the form has been submitted"
					);
				}

				node.dispatchEvent(
					new CustomEvent('submitsucceeded', {
						detail: {
							response: _getResultFromFormAction(result.data, options),
							formData: convertFormDataToObject(formData),
							parsedFormData: parsedFormData?.data
						}
					}) satisfies SubmitSucceededEventType<TSchema, TFormAction, TKey>
				);
			} else if (result.type == 'redirect') {
				node.dispatchEvent(
					new CustomEvent('submitredirected', {
						detail: {
							redirectUrl: result.location.startsWith('/')
								? new URL(location.origin + result.location)
								: new URL(result.location),
							formData: convertFormDataToObject(formData)
						}
					}) satisfies SubmitRedirectedEventType<TSchema>
				);
			} else if (result.type == 'error') {
				node.dispatchEvent(
					new CustomEvent('submitfailed', {
						detail: {
							error: getFormErrors(result),
							formData: convertFormDataToObject(formData)
						}
					}) satisfies SubmitFailedEventType<TFormAction>
				);
			} else if (result.type == 'failure') {
				node.dispatchEvent(
					new CustomEvent('submitfailed', {
						detail: {
							error: getFormErrors(result.data as any),
							formData: convertFormDataToObject(formData)
						}
					}) satisfies SubmitFailedEventType<TFormAction>
				);
			}

			if (options?.ignoreSamePageConstraint) {
				if (result.type === 'success') {
					if (options.resetOnSubmit) {
						HTMLFormElement.prototype.reset.call(node);
					}
					if (options.invalidateAllAfterSubmit ?? true) {
						await invalidateAll();
					}
				}

				if (result.type === 'redirect' || result.type === 'error') {
					applyAction(result);
				}
			} else {
				await update({
					reset: options?.resetOnSubmit,
					invalidateAll: options?.invalidateAllAfterSubmit ?? true
				});
			}
		};
	};
}

function _getResultFromFormAction<
	TSchema extends z.ZodTypeAny,
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

function _fireSubmitFailureForClientSideError<
	TSchema extends z.ZodTypeAny,
	TFormAction extends StandardFormActionError
>(node: HTMLFormElement, event: SubmitClientErrorEventType<TSchema>) {
	node.dispatchEvent(
		new CustomEvent('submitfailed', {
			detail: {
				error: {
					errors: event.detail.errors as any,
					message: 'Invalid form, please review your inputs'
				},
				formData: event.detail.formData
			}
		}) satisfies SubmitFailedEventType<TFormAction>
	);
}

function _superResetHandler(event: Event) {
	const node = event.target as HTMLFormElement;
	_focusOnFirstVisibleInput(node);
}

function _focusOnFirstVisibleInput(node: HTMLFormElement) {
	node.querySelector<HTMLInputElement>("input:not([type='hidden'])")?.focus();
}
