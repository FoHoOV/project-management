import { browser } from '$app/env';
import { goto, refreshAll } from '$app/navigation';
import { resolve } from '$app/paths';
import { redirect } from '@sveltejs/kit';
import type { z } from 'zod';
import type { ErrorMessage, NumberRange } from '#lib/utils/types/index.js';
import { HTTPValidationError, UserFriendlyErrorSchema } from '#lib/generated-client/zod.gen.js';
import { ErrorCode } from '#lib/generated-client/index.js';
import { ApiError } from './clients';
import { extractKeys as extractKeysFromZod } from '#lib/utils/zod/index.js';

export const handleUnauthenticatedUser = async () => {
	if (browser) {
		await refreshAll();
		await goto(resolve('/user/logout?session-expired=true'));
		return;
	} else {
		redirect(303, '/user/logout?session-expired=true');
	}
};

const _defaultUnAuthenticatedUserHandler = async <
	TSchema extends z.ZodObject,
	TErrorCallbackResult extends Promise<unknown>
>(
	onError: Required<ServiceCallOptions<never, TSchema, TErrorCallbackResult>>['errorHandler'],
	e: Extract<ServiceError<TSchema>, { type: ErrorType.NOT_AUTHENTICATED }>
): Promise<{
	success: false;
	error: Awaited<TErrorCallbackResult>;
}> => {
	const result = await onError(e);
	if (e.preventDefaultHandler) {
		return { success: false, error: result };
	}
	return {
		success: false,
		error: (await handleUnauthenticatedUser()) as Awaited<TErrorCallbackResult>
	};
};

export enum ErrorType {
	VALIDATION_ERROR,
	API_ERROR,
	SERVICE_DOWN_ERROR,
	UNKNOWN_ERROR,
	NOT_AUTHENTICATED
}

export type ServiceError<TErrorSchema extends z.ZodObject> =
	| {
			type: ErrorType.VALIDATION_ERROR;
			message: ErrorMessage;
			status: NumberRange<400, 600>;
			code: Extract<ErrorCode, 'invalid_input'>;
			validationError: TErrorSchema extends z.ZodObject ? z.infer<TErrorSchema> : never;
			response: Record<string, any>;
			originalError: ApiError;
	  }
	| {
			type: ErrorType.API_ERROR;
			message: string;
			status: NumberRange<400, 600>;
			code: ErrorCode;
			response: Record<string, any>;
			originalError: ApiError;
	  }
	| {
			type: ErrorType.SERVICE_DOWN_ERROR;
			message: string;
			status: 503;
			data: never;
			originalError: ApiError;
	  }
	| {
			type: ErrorType.UNKNOWN_ERROR;
			message: ErrorMessage;
			status: NumberRange<400, 600>;
			originalError: unknown;
	  }
	| {
			type: ErrorType.NOT_AUTHENTICATED;
			message: ErrorMessage;
			status: NumberRange<400, 600>;
			data: unknown;
			preventDefaultHandler: boolean;
			originalError: ApiError;
	  };

export type ServiceCallOptions<
	TServiceCallResult extends Promise<unknown>,
	TErrorSchema extends z.ZodObject,
	TErrorCallbackResult extends Promise<unknown>
> = {
	/**
	 * @returns in case of successful api-call whatever this function returns will be in the return value of service call wrapper
	 */
	call: () => TServiceCallResult;
	errorSchema?: TErrorSchema;
	/**
	 * @returns in case of failed api-call whatever this function returns will be in the return value of service call wrapper
	 */
	errorHandler?: (e: ServiceError<TErrorSchema>) => TErrorCallbackResult;
};

export async function callService<
	TServiceCallResult extends Promise<unknown>,
	TErrorSchema extends z.ZodObject,
	TErrorCallbackResult extends Promise<unknown> = Promise<ServiceError<TErrorSchema>>
>({
	call,
	errorSchema,
	errorHandler = (async (e) => {
		if (e.type === ErrorType.NOT_AUTHENTICATED) {
			await handleUnauthenticatedUser();
		}
		return e;
	}) as Required<
		ServiceCallOptions<TServiceCallResult, TErrorSchema, TErrorCallbackResult>
	>['errorHandler']
}: ServiceCallOptions<TServiceCallResult, TErrorSchema, TErrorCallbackResult>): Promise<
	| { success: false; error: Awaited<TErrorCallbackResult> }
	| { success: true; response: Awaited<TServiceCallResult> }
> {
	try {
		return {
			success: true,
			response: await call()
		};
	} catch (e) {
		if (!(e instanceof ApiError)) {
			return {
				success: false,
				error: await errorHandler({
					type: ErrorType.UNKNOWN_ERROR,
					status: 500,
					message: 'An unknown error has occurred, please try again',
					originalError: e
				})
			};
		}

		if (!e.response) {
			return await _handleNonHttpError(e, errorHandler);
		}

		const response = e.body;
		const status = _getResponseErrorCode(e.response.status);

		if (typeof response !== 'object' || response === null) {
			return {
				success: false,
				error: await errorHandler({
					type: ErrorType.API_ERROR,
					status,
					code: ErrorCode.UNKNOWN_ERROR,
					message:
						e.response.status < 400
							? 'Service response was in an unexpected format'
							: e.response.statusText,
					response: {},
					originalError: e
				})
			};
		}

		if (e.response.status === 401) {
			return await _defaultUnAuthenticatedUserHandler(errorHandler, {
				type: ErrorType.NOT_AUTHENTICATED,
				status,
				message: 'Invalid credentials!',
				data: response,
				preventDefaultHandler: false,
				originalError: e
			});
		}

		if (e.response.status == 422 && errorSchema) {
			const validationErrors = await _convertHttpValidationErrorToZodError(
				errorSchema,
				response as z.infer<typeof HTTPValidationError>
			);

			if (!validationErrors) {
				return {
					success: false,
					error: await errorHandler({
						type: ErrorType.API_ERROR,
						status,
						code: ErrorCode.UNKNOWN_ERROR,
						message: 'Some validation errors has ocurred, please review you inputs',
						response,
						originalError: e
					})
				};
			} else {
				return {
					success: false,
					error: await errorHandler({
						type: ErrorType.VALIDATION_ERROR,
						status,
						code: ErrorCode.INVALID_INPUT,
						message: 'Some validation errors has ocurred, please review you inputs',
						response,
						validationError: validationErrors as any, // TODO: why do we need to cast here?
						originalError: e
					})
				};
			}
		}

		const userFriendlyError = await UserFriendlyErrorSchema.safeParseAsync(response);
		if (userFriendlyError.success) {
			return {
				success: false,
				error: await errorHandler({
					type: ErrorType.API_ERROR,
					status,
					code: userFriendlyError.data.code,
					message: userFriendlyError.data.message,
					response,
					originalError: e
				})
			};
		}

		const responseRecord = response as Record<string, any>;
		return {
			success: false,
			error: await errorHandler({
				type: ErrorType.API_ERROR,
				status,
				code: ErrorCode.UNKNOWN_ERROR,
				message: responseRecord.message ?? responseRecord.detail ?? e.message,
				response: responseRecord,
				originalError: e
			})
		};
	}
}

async function _handleNonHttpError<
	TErrorSchema extends z.ZodObject,
	TErrorCallbackResult extends Promise<unknown>
>(
	e: ApiError,
	errorHandler: Required<
		ServiceCallOptions<never, TErrorSchema, TErrorCallbackResult>
	>['errorHandler']
) {
	const isTimeout =
		e.body instanceof DOMException && ['AbortError', 'TimeoutError'].includes(e.body.name);

	if (isTimeout || e.body instanceof TypeError) {
		return {
			success: false as const,
			error: await errorHandler({
				type: ErrorType.SERVICE_DOWN_ERROR,
				status: 503,
				message: isTimeout
					? 'Request timed out, please try again'
					: 'Service is temporarily down, please try again later',
				data: e as never,
				originalError: e
			})
		};
	}

	return {
		success: false as const,
		error: await errorHandler({
			type: ErrorType.UNKNOWN_ERROR,
			status: 500,
			message: 'An unknown error has occurred, please try again',
			originalError: e
		})
	};
}

function _getResponseErrorCode(status: number): NumberRange<400, 600> {
	if (status < 400) {
		return 500;
	}
	if (status > 599) {
		return 500;
	}
	return status as NumberRange<400, 600>;
}

async function _convertHttpValidationErrorToZodError<TErrorSchema extends z.ZodObject>(
	schema: TErrorSchema,
	validationError: z.infer<typeof HTTPValidationError>
): Promise<z.infer<TErrorSchema> | null> {
	// if there were multiple errors in `loc` this function only return the first one

	const parsedValidationError = await HTTPValidationError.safeParseAsync(validationError);

	if (!parsedValidationError.success || !parsedValidationError.data.detail) {
		return null;
	}

	const keys = extractKeysFromZod(schema);

	if (keys.length == 0) {
		return null;
	}

	const constructedErrors: Record<string, string> = {};

	parsedValidationError.data.detail.forEach((error) => {
		let key: string | null = null;
		error.loc.some((errorKey) => {
			keys.forEach((_key) => {
				if (_key === errorKey) {
					key = errorKey;
				}
			});

			// prevent more iterations
			return key != null;
		});

		if (!key) {
			return;
		}

		constructedErrors[key] = error.msg;
	});

	if (Object.keys(constructedErrors).length == 0) {
		return null;
	}

	return constructedErrors as z.infer<TErrorSchema>;
}
