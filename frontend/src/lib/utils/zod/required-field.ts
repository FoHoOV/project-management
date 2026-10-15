import type { z } from 'zod';

/**
 * Turns a generated optional field (`X.nullish()`, e.g. on update schemas) back into `X`,
 * for forms where the field must be filled in.
 */
export function requiredField<T extends z.ZodType>(schema: z.ZodOptional<z.ZodNullable<T>>): T {
	return schema.unwrap().unwrap();
}
