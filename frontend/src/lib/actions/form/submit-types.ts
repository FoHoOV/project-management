import type { SubmitFunction } from '@sveltejs/kit';
import type { z } from 'zod';
import type { ValidatorOptions } from './validator-types';
import type { StandardFormActionNames } from './utils';

export type EnhanceOptions<
	TSchema extends z.ZodTypeAny,
	TFormAction,
	TKey extends StandardFormActionNames<TFormAction> = never
> = {
	form: TFormAction;
	validator: ValidatorOptions<TSchema>;
	submit?: SubmitFunction;
	action?: TKey;
	resetOnSubmit?: boolean;
	invalidateAllAfterSubmit?: boolean;
};

export type FormActionResultType<
	TFormAction,
	TKey extends StandardFormActionNames<TFormAction> = never
> = TFormAction extends { response: infer TResult }
	? Extract<TFormAction, { response: TResult }>['response']
	: Extract<Pick<NonNullable<TFormAction>, TKey>[TKey], { response: any }>['response'];

export type SubmitEvents<
	TSchema extends z.ZodTypeAny,
	TFormAction,
	TKey extends StandardFormActionNames<TFormAction> = never
> = {
	'on:submitstarted'?: (e: SubmitStartEventType) => void;
	'on:submitended'?: (e: SubmitEndedEventType) => void;
	'on:submitredirected'?: (e: SubmitRedirectedEventType<TSchema>) => void;
	'on:submitsucceeded'?: (e: SubmitSucceededEventType<TSchema, TFormAction, TKey>) => void;
};

export type SubmitStartEventType = CustomEvent<void>;

export type SubmitEndedEventType = CustomEvent<void>;

export type SubmitRedirectedEventType<TSchema extends z.ZodTypeAny> = CustomEvent<{
	redirectUrl: URL;
	formData: z.infer<TSchema>;
}>;

export type SubmitSucceededEventType<
	TSchema extends z.ZodTypeAny,
	TFormAction,
	TKey extends StandardFormActionNames<TFormAction> = never
> = CustomEvent<{
	response: FormActionResultType<TFormAction, TKey>;
	formData: z.infer<TSchema>;
}>;
