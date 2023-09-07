import type { ActionReturn } from 'svelte/action';
import type { z } from 'zod';
import { convertFormDataToObject } from './utils';

export type ValidatorErrorsType<T extends z.ZodTypeAny> = z.typeToFlattenedError<z.infer<T>>['fieldErrors'];

export type ValidatorOptions<TSchema extends z.ZodTypeAny> = {
	schema: TSchema;
};

export type ValidatorErrorEvent<TSchema extends z.ZodTypeAny> = {
	'on:submitclienterror': (e: CustomEvent<ValidatorErrorsType<TSchema>>) => void;
};

export function validate<TSchema extends z.ZodTypeAny>(
	node: HTMLFormElement,
	options: ValidatorOptions<TSchema>
): ActionReturn<ValidatorOptions<TSchema>, ValidatorErrorEvent<TSchema>> {
	const formClientSideValidateHandler = async (event: SubmitEvent) => {
		if (!options) {
			return;
		}
		const errors = await getClientSideFormErrors(new FormData(node), options.schema);

		if (Object.keys(errors).length === 0) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		event.stopImmediatePropagation();
		node.dispatchEvent(new CustomEvent('submitclienterror', { detail: errors }));
	};

	node.addEventListener('submit', formClientSideValidateHandler);

	return {
		destroy() {
			node.removeEventListener('submit', formClientSideValidateHandler);
		}
	};
}


export async function getClientSideFormErrors<TSchema extends z.ZodTypeAny>(
	formData: FormData,
	zodObject: z.ZodTypeAny
): Promise<ValidatorErrorsType<TSchema>> {
	const validationsResult = await zodObject.safeParseAsync(convertFormDataToObject(formData));
	if (validationsResult.success) {
		return {};
	} else {
		return validationsResult.error.flatten().fieldErrors;
	}
}

