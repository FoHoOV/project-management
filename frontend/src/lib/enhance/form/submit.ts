import type { ActionReturn } from 'svelte/action';
import type { SubmitFunction } from '@sveltejs/kit';
import { enhance } from '$app/forms';

import type { z } from 'zod';
import { validate, type ValidatorErrorEvent, type ValidatorOptions } from './validator';

export type EnhanceOptions<TActionData = unknown> = {
	submit?: SubmitFunction;
	form?: TActionData;
};

export type SubmitEvents<
	TSchema extends z.ZodTypeAny,
	TActionData extends { result?: TResult } | undefined | null = any,
	TResult = unknown
> = {
	'on:submitstarted'?: (e: CustomEvent<void>) => void;
	'on:submitended'?: (e: CustomEvent<void>) => void;
	'on:submitsucceeded'?: (
		e: CustomEvent<{
			response: NonNullable<NonNullable<TActionData>['result']>;
			formData: z.infer<TSchema>;
		}>
	) => void;
};

export function superEnhance<
	TSchema extends z.ZodTypeAny,
	TActionData extends { result?: TResult } | undefined | null = any,
	TResult = unknown
>(
	node: HTMLFormElement,
	options?: Partial<EnhanceOptions<TActionData>>
): ActionReturn<ValidatorOptions<TSchema>, SubmitEvents<TSchema, TActionData>>;
export function superEnhance<
	TSchema extends z.ZodTypeAny,
	TActionData extends { result?: TResult } | undefined | null = any,
	TResult = unknown
>(
	node: HTMLFormElement,
	options: { validator: ValidatorOptions<TSchema> } & Partial<EnhanceOptions<TActionData>>
): ActionReturn<
	ValidatorOptions<TSchema>,
	ValidatorErrorEvent<TSchema> & SubmitEvents<TSchema, TActionData>
>;
export function superEnhance<
	TSchema extends z.ZodTypeAny,
	TActionData extends { result?: TResult } | undefined | null = any,
	TResult = unknown
>(
	node: HTMLFormElement,
	options?: { validator?: ValidatorOptions<TSchema> } & Partial<EnhanceOptions<TActionData>>
): ActionReturn<ValidatorOptions<TSchema>, SubmitEvents<TSchema, TActionData>> {
	const handleSubmit: SubmitFunction =
		options?.submit ||
		(({ formData }) => {
			node.dispatchEvent(new CustomEvent('submitstarted'));

			return async ({ update, result }) => {
				// TODO: CustomEvent<infer param of SubmitEvent<on:submitended>
				node.dispatchEvent(new CustomEvent('submitended'));
				await update();
				if (result.type == 'success') {
					node.dispatchEvent(
						new CustomEvent('submitsucceeded', {
							detail: {
								response: result.data?.result,
								formData: Object.fromEntries(formData)
							}
						})
					);
				}
			};
		});

	const validatorReturn = options?.validator && validate(node, options.validator);
	const enhanceReturn = enhance(node, handleSubmit);

	return {
		destroy() {
			validatorReturn?.destroy && validatorReturn.destroy();
			enhanceReturn.destroy();
		}
	};
}
