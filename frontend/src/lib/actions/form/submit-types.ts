import type { SubmitFunction } from '@sveltejs/kit';
import type { z } from 'zod';
import type { ValidatorOptions } from './validator-types';

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
	TKey extends keyof NonNullable<TFormAction> = never
> = CustomEvent<{
	response: FormActionResultType<TFormAction, TKey>;
	formData: z.infer<TSchema>;
}>;
