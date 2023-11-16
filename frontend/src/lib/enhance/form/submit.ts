import type { ActionReturn } from 'svelte/action';
import type { SubmitFunction } from '@sveltejs/kit';
import { enhance } from '$app/forms';

import type { z } from 'zod';
import { validate, type ValidatorErrorEvent, type ValidatorOptions } from './validator';

export type EnhanceOptions<
	TSchema extends z.ZodTypeAny,
	TFormAction,
	TKey extends keyof NonNullable<TFormAction> = never
> = {
	submit?: SubmitFunction;
	form: TFormAction;
	action?: TKey;
	validator: ValidatorOptions<TSchema>;
};

export type FormActionResultType<
	TFormAction,
	TKey extends keyof NonNullable<TFormAction> = never
> = TFormAction extends { response: infer TResult }
	? Extract<TFormAction, { response: TResult }>['response']
	: Extract<Pick<NonNullable<TFormAction>, TKey>[TKey], { response: any }>['response'];

export type SubmitEvents<
	TSchema extends z.ZodTypeAny,
	TFormAction,
	TKey extends keyof NonNullable<TFormAction> = never
> = {
	'on:submitstarted'?: (e: CustomEvent<void>) => void;
	'on:submitended'?: (e: CustomEvent<void>) => void;
	'on:submitsucceeded'?: (
		e: CustomEvent<{
			response: FormActionResultType<TFormAction, TKey>;
			formData: z.infer<TSchema>;
		}>
	) => void;
};

export function superEnhance(
	node: HTMLFormElement
): ActionReturn<
	undefined,
	Pick<SubmitEvents<never, never, never>, 'on:submitstarted' | 'on:submitended'>
>;
export function superEnhance<TSchema extends z.ZodTypeAny>(
	node: HTMLFormElement,
	options: Pick<EnhanceOptions<TSchema, never>, 'validator'>
): ActionReturn<
	Pick<EnhanceOptions<TSchema, never>, 'validator'>,
	ValidatorErrorEvent<TSchema> &
		Pick<SubmitEvents<TSchema, never, never>, 'on:submitstarted' | 'on:submitended'>
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

	const validatorReturn = options?.validator && validate(node, options.validator);
	const enhanceReturn = enhance(node, handleSubmit);

	return {
		destroy() {
			validatorReturn?.destroy && validatorReturn.destroy();
			enhanceReturn.destroy();
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
		node.dispatchEvent(new CustomEvent('submitstarted'));

		return async ({ update, result }) => {
			node.dispatchEvent(new CustomEvent('submitended'));
			await update();

			if (result.type != 'success') {
				return;
			}
			console.debug('s-form-result');
			console.debug(_getResultFromFormAction(result.data, options));
			console.debug('e-form-result');

			node.dispatchEvent(
				new CustomEvent('submitsucceeded', {
					detail: {
						response: _getResultFromFormAction(result.data, options),
						formData: Object.fromEntries(formData)
					}
				})
			);
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
