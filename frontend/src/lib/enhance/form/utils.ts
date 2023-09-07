import { fail } from '@sveltejs/kit';
import type { NumberRange, ErrorMessage } from '$lib/utils/types';
import type { z } from 'zod';
import type { ValidatorErrorsType } from './validator';
import type { TscErrorInfo } from 'vitest';

export function convertFormDataToObject(formData: FormData): Record<string, FormDataEntryValue> {
	const result: Record<string, FormDataEntryValue> = {};
	formData.forEach((value, key) => {
		result[key] = value;
	});
	return result;
}

export type FailedActionProps<T> = {
	message: ErrorMessage;
	error?: T;
};

export function getFormErrors<
	Form extends { error?: TError | undefined; message?: ErrorMessage | undefined } | null,
	TError = NonNullable<Form>['error']
>(form: Form) {
	return { errors: form?.error, message: form?.message };
}

export function failedActionData({ message }: FailedActionProps<never>): {
	message: ErrorMessage;
	error: never;
};
export function failedActionData<T>({ message, error }: FailedActionProps<T>): {
	message: ErrorMessage;
	error: T;
};
export function failedActionData<T>({ message, error }: FailedActionProps<T>) {
	return { message, error };
}

export function superFail<T = never>(
	status: NumberRange<400, 500>,
	{ message, error }: FailedActionProps<T>
) {
	return fail(status, failedActionData({ message, error }));
}
