import type { ParsedFormData } from '$lib/actions/form/utils';
import type { z } from 'zod';

export type ValidatorErrorsType<T extends z.ZodTypeAny> = z.typeToFlattenedError<
	z.infer<T>
>['fieldErrors'];

export type ValidatorOptions<TSchema extends z.ZodTypeAny> = {
	schema: TSchema;
};

export type ValidatorErrorEvents<TSchema extends z.ZodTypeAny> = {
	onsubmitclienterror: (e: SubmitClientErrorEventType<TSchema>) => void;
};

export type SubmitClientErrorEventType<TSchema extends z.ZodTypeAny> = CustomEvent<{
	errors: ValidatorErrorsType<TSchema>;
	formData: ParsedFormData;
}>;
