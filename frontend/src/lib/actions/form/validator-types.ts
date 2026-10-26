import type { z } from 'zod';

export type ValidatorErrorsType<T extends z.ZodType> = z.ZodFlattenedError<
	z.infer<T>
>['fieldErrors'];

export type ValidatorOptions<TSchema extends z.ZodType> = {
	schema: TSchema;
};
