import type { ParsedFormData } from '#lib/actions/form/utils.js';
import type { z } from 'zod';

export type ValidatorErrorsType<T extends z.ZodType> = z.ZodFlattenedError<
	z.infer<T>
>['fieldErrors'];

export type ValidatorOptions<TSchema extends z.ZodType> = {
	schema: TSchema;
};

export type ValidatorErrorEvents<TSchema extends z.ZodType> = {
	onsubmitclienterror: (e: SubmitClientErrorEventType<TSchema>) => void;
};

export type SubmitClientErrorEventType<TSchema extends z.ZodType> = CustomEvent<{
	errors: ValidatorErrorsType<TSchema>;
	formData: ParsedFormData;
}>;
