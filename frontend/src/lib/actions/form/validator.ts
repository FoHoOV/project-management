import type { ActionReturn } from 'svelte/action';
import type { z } from 'zod';
import { convertFormDataToObject } from './utils';
import type {
	ValidatorOptions,
	ValidatorErrorEvent,
	ValidatorErrorsType,
	SubmitClientErrorEventType
} from './validator-types';

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
		console.log(errors);
		event.preventDefault();
		event.stopPropagation();
		event.stopImmediatePropagation();
		node.dispatchEvent(
			new CustomEvent('submitclienterror', {
				detail: errors
			}) satisfies SubmitClientErrorEventType<TSchema>
		);
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
