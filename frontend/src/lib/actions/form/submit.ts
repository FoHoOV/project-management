import type { ActionReturn } from 'svelte/action';
import type { SubmitFunction } from '@sveltejs/kit';
import { enhance } from '$app/forms';

import type { z } from 'zod';
import type {
	SubmitEvents,
	EnhanceOptions,
	FormActionResultType,
	SubmitRedirectedEventType,
	SubmitStartEventType,
	SubmitEndedEventType,
	SubmitSucceededEventType
} from './submit-types';
import { validate } from './validator';
import type { ValidatorErrorEvent } from './validator-types';

export function superEnhance(
	node: HTMLFormElement
): ActionReturn<
	undefined,
	Pick<SubmitEvents<never, never, never>, 'on:submitstarted' | 'on:submitended'>
>;
export function superEnhance<
	TSchema extends z.ZodTypeAny,
	TFormAction,
	TKey extends keyof NonNullable<TFormAction> = never
>(
	node: HTMLFormElement,
	options: EnhanceOptions<TSchema, TFormAction, TKey>
): ActionReturn<
	EnhanceOptions<TSchema, TFormAction, TKey>,
	ValidatorErrorEvent<TSchema> & SubmitEvents<TSchema, TFormAction, TKey>
>;
export function superEnhance<
	TSchema extends z.ZodTypeAny,
	TFormAction = never,
	TKey extends keyof NonNullable<TFormAction> = never
>(node: HTMLFormElement, options?: Partial<EnhanceOptions<TSchema, TFormAction, TKey>>) {
	const handleSubmit =
		options?.submit ?? _defaultSubmitHandler<TSchema, TFormAction, TKey>(node, options);

	const validator = options?.validator && validate(node, options.validator);
	const enhancer = enhance(node, handleSubmit);
	node.addEventListener('reset', _superResetHandler);

	return {
		destroy() {
			validator?.destroy && validator.destroy();
			enhancer.destroy();
			node.removeEventListener('reset', _superResetHandler);
		}
	};
}

function _defaultSubmitHandler<
	TSchema extends z.ZodTypeAny,
	TFormAction,
	TKey extends keyof NonNullable<TFormAction> = never
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
				node.dispatchEvent(
					new CustomEvent('submitsucceeded', {
						detail: {
							response: _getResultFromFormAction(result.data, options),
							formData: Object.fromEntries(formData) as z.infer<TSchema>
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
							formData: Object.fromEntries(formData)
						}
					}) satisfies SubmitRedirectedEventType<TSchema>
				);
			}

			await update({ reset: options?.resetOnSubmit });
		};
	};
}

function _getResultFromFormAction<
	TSchema extends z.ZodTypeAny,
	TFormAction,
	TKey extends keyof NonNullable<TFormAction> = never
>(
	data: Record<string, any> | undefined,
	options: Partial<EnhanceOptions<TSchema, TFormAction, TKey>> | undefined
): FormActionResultType<TFormAction, TKey> {
	if (!data) {
		throw new Error("form action didn't return anything which is an unexpected behavior");
	}

	if (!options || !options.action) {
		return data['response'];
	}

	return data[options.action as string]['response'];
}

function _superResetHandler(event: Event) {
	const node = event.target as HTMLFormElement;
	_focusOnFirstVisibleInput(node);
}

function _focusOnFirstVisibleInput(node: HTMLFormElement) {
	node.querySelector<HTMLInputElement>("input:not([type='hidden'])")?.focus();
}
