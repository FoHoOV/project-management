import { z } from 'zod';
import { convertFormDataToObject } from './utils';
import type { ValidatorErrorsType } from './validator-types';

export async function getClientSideFormErrors<TSchema extends z.ZodType>(
	formData: FormData,
	zodObject: z.ZodType
): Promise<ValidatorErrorsType<TSchema>> {
	const validationsResult = await zodObject.safeParseAsync(convertFormDataToObject(formData));
	if (validationsResult.success) {
		return {};
	} else {
		return z.flattenError(validationsResult.error).fieldErrors;
	}
}
