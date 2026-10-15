import type { ActionReturn } from 'svelte/action';
import { z } from 'zod';
import { convertFormDataToObject } from './utils';
import type {
	ValidatorOptions,
	ValidatorErrorEvents,
	ValidatorErrorsType,
	SubmitClientErrorEventType
} from './validator-types';

export function validate<TSchema extends z.ZodType>(
	node: HTMLFormElement,
	options: ValidatorOptions<TSchema>
): ActionReturn<ValidatorOptions<TSchema>, ValidatorErrorEvents<TSchema>> {
	const formClientSideValidateHandler = async (event: SubmitEvent) => {
		if (!options) {
			return;
		}
		const errors = await getClientSideFormErrors(new FormData(node), options.schema);

		if (Object.keys(errors).length === 0) {
			return;
		}
		console.log({
			input: convertFormDataToObject(new FormData(node)),
			errors
		});
		event.preventDefault();
		event.stopPropagation();
		event.stopImmediatePropagation();
		node.dispatchEvent(
			new CustomEvent('submitclienterror', {
				detail: { errors, formData: convertFormDataToObject(new FormData(node)) }
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
