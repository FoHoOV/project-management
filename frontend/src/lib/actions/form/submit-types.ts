import type { SubmitFunction } from '$app/forms';
import type { z } from 'zod';
import type { ValidatorErrorsType, ValidatorOptions } from './validator-types';
import type {
	ParsedFormData,
	StandardFormActionError,
	StandardFormActionNames,
	getFormErrors
} from './utils';

export type EnhanceOptions<
	TSchema extends z.ZodType,
	TFormAction extends StandardFormActionError,
	TKey extends StandardFormActionNames<TFormAction> = never
> = {
	validator: ValidatorOptions<TSchema>;
	submit?: SubmitFunction;
	actionName?: TKey;
	resetOnSubmit?: boolean;
	refreshAllAfterSubmit?: boolean;
};

export type FormActionResultType<
	TFormAction extends StandardFormActionError,
	TKey extends StandardFormActionNames<TFormAction> = never
> = TFormAction extends { response: infer TResult }
	? Extract<TFormAction, { response: TResult }>['response']
	: TKey extends keyof NonNullable<TFormAction>
		? Extract<Pick<NonNullable<TFormAction>, TKey>[TKey], { response: any }>['response']
		: never;

export type SubmitCallbacks<
	TSchema extends z.ZodType,
	TFormAction extends StandardFormActionError,
	TKey extends StandardFormActionNames<TFormAction> = never
> = {
	onSubmitStarted?: () => void;
	onSubmitEnded?: () => void;
	onSubmitSucceeded?: (event: SubmitSucceededEvent<TSchema, TFormAction, TKey>) => void;
	onRedirected?: (event: SubmitRedirectedEvent) => void;
	/** called on both client-side and server-side errors */
	onSubmitFailed?: (event: SubmitFailedEvent<TFormAction>) => void;
	onClientSideValidationErrors?: (errors: ValidatorErrorsType<TSchema>) => void;
};

export type SubmitRedirectedEvent = {
	redirectUrl: URL;
	formData: ParsedFormData;
};

export type SubmitSucceededEvent<
	TSchema extends z.ZodType,
	TFormAction extends StandardFormActionError,
	TKey extends StandardFormActionNames<TFormAction> = never
> = {
	response: FormActionResultType<TFormAction, TKey>;
	formData: ParsedFormData;
	parsedFormData: z.infer<TSchema>;
};

export type SubmitFailedEvent<TFormAction extends StandardFormActionError> = {
	formData: ParsedFormData;
	error: ReturnType<typeof getFormErrors<TFormAction>>;
};
