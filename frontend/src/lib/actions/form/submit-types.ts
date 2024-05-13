import type { SubmitFunction } from '@sveltejs/kit';
import type { z } from 'zod';
import type { ValidatorOptions } from './validator-types';
import type {
	ParsedFormData,
	StandardFormActionError,
	StandardFormActionNames,
	getFormErrors
} from './utils';

export type EnhanceOptions<
	TSchema extends z.ZodTypeAny,
	TFormAction extends StandardFormActionError,
	TKey extends StandardFormActionNames<TFormAction> = never
> = {
	form: TFormAction;
	validator: ValidatorOptions<TSchema>;
	submit?: SubmitFunction;
	actionName?: TKey;
	resetOnSubmit?: boolean;
	invalidateAllAfterSubmit?: boolean;
	/**
	 * @param ignoreSamePageConstraint
	 * by default if the page we are in has a different url than the action, it will not update the form and page store, and error page redirection etc ...
	 * here is official docs for this behavior: //https://kit.svelte.dev/docs/form-actions#progressive-enhancement-customising-use-enhance
	 */
	ignoreSamePageConstraint?: boolean;
};

export type FormActionResultType<
	TFormAction extends StandardFormActionError,
	TKey extends StandardFormActionNames<TFormAction> = never
> = TFormAction extends { response: infer TResult }
	? Extract<TFormAction, { response: TResult }>['response']
	: TKey extends keyof NonNullable<TFormAction>
		? Extract<Pick<NonNullable<TFormAction>, TKey>[TKey], { response: any }>['response']
		: never;

export type SubmitEvents<
	TSchema extends z.ZodTypeAny,
	TFormAction extends StandardFormActionError,
	TKey extends StandardFormActionNames<TFormAction> = never
> = {
	onsubmitstarted?: (e: SubmitStartEventType) => void;
	onsubmitended?: (e: SubmitEndedEventType) => void;
	onsubmitredirected?: (e: SubmitRedirectedEventType<TSchema>) => void;
	onsubmitsucceeded?: (e: SubmitSucceededEventType<TSchema, TFormAction, TKey>) => void;
	onsubmitfailed?: (
		e: SubmitFailedEventType<TFormAction>
	) => void /*** called on both client-side and server-side errors*/;
};

export type SubmitStartEventType = CustomEvent<void>;

export type SubmitEndedEventType = CustomEvent<void>;

export type SubmitRedirectedEventType<TSchema extends z.ZodTypeAny> = CustomEvent<{
	redirectUrl: URL;
	formData: ParsedFormData;
}>;

export type SubmitSucceededEventType<
	TSchema extends z.ZodTypeAny,
	TFormAction extends StandardFormActionError,
	TKey extends StandardFormActionNames<TFormAction> = never
> = CustomEvent<{
	response: FormActionResultType<TFormAction, TKey>;
	formData: ParsedFormData;
	parsedFormData: z.infer<TSchema>;
}>;

export type SubmitFailedEventType<TFormAction extends StandardFormActionError> = CustomEvent<{
	formData: ParsedFormData;
	error: ReturnType<typeof getFormErrors<TFormAction>>;
}>;
