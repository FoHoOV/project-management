import { z } from 'zod';

export const extractKeys = (schema: z.ZodType): string[] => {
	if (schema instanceof z.ZodNullable || schema instanceof z.ZodOptional) {
		return extractKeys(schema.unwrap() as z.ZodType);
	}
	if (schema instanceof z.ZodArray) {
		return extractKeys(schema.element as z.ZodType);
	}
	if (schema instanceof z.ZodObject) {
		const entries = Object.entries(schema.shape as Record<string, z.ZodType>);
		return entries.flatMap(([key, value]) => {
			const nested = extractKeys(value).map((subKey) => `${key}.${subKey}`);
			return nested.length ? nested : key;
		});
	}
	return [];
};
