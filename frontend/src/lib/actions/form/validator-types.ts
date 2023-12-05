import type { z } from 'zod';

export type ValidatorErrorsType<T extends z.ZodTypeAny> = z.typeToFlattenedError<
	z.infer<T>
>['fieldErrors'];

export type ValidatorOptions<TSchema extends z.ZodTypeAny> = {
	schema: TSchema;
};

export type ValidatorErrorEvent<TSchema extends z.ZodTypeAny> = {
	'on:submitclienterror': (e: CustomEvent<ValidatorErrorsType<TSchema>>) => void;
};

export type SubmitClientErrorEventType<TSchema extends z.ZodTypeAny> = CustomEvent<
	ValidatorErrorsType<TSchema>
>;
