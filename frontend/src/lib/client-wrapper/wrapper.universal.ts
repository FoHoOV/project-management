import { browser } from '$app/environment';
import { goto, invalidateAll } from '$app/navigation';
import { PUBLIC_API_URL } from '$env/static/public';
import { redirect } from '@sveltejs/kit';
import type { z } from 'zod';
import type { ErrorMessage } from '$lib/utils/types';
import { RequiredError, FetchError, ResponseError } from '$lib/generated-client/runtime';
import { TokenError } from '$lib/utils/token';
import { UserFriendlyErrorSchema } from '$lib/generated-client/zod/schemas';
import { ErrorCode } from '$lib/generated-client/models';

export const createRequest = (url: string, token?: string): Request => {
	const request = new Request(url);
	if (token) {
		request.headers.set('Authorization', `bearer: ${token}`);
	}
	return request;
};

export type ErrorHandler = <TError>(error: TError) => void;

export const genericGet = async <TResponse, TError = unknown>(
	path: string,
	parameters: Record<string, any> = {},
	config: RequestInit = {},
	onError: ErrorHandler | undefined = undefined
) => {
	const res = await fetch(`${path}?${new URLSearchParams(parameters)}`, {
		method: 'get',
		headers: {
			'Content-Type': 'application/json'
		},
		...config
	});
	const json = await res.json();

	if (!res.ok) {
		if (onError) {
			return onError(<TError>json);
		}
		throw Error('Some errors has occurred');
	}

	return <TResponse>json;
};

export const genericPost = async <TResponse, TError = unknown>(
	path: string,
	data: Record<string, any> = {},
	config: RequestInit = {},
	onError: ErrorHandler | undefined = undefined
) => {
	const res = await fetch(path, {
		method: 'post',
		body: JSON.stringify(data),
		headers: {
			'Content-Type': 'application/json'
		},
		...config
	});

	const json = await res.json();
	if (!res.ok) {
		if (onError) {
			return onError(<TError>json);
		}
		throw Error('Some errors has occurred');
	}

	return <TResponse>json;
};

export const getToExternal = async <TResponse, TError = unknown>(
	endPoint: string,
	data: Record<string, any> = {},
	config: RequestInit = {},
	onError: ErrorHandler | undefined = undefined
) => {
	return genericGet<TResponse, TError>(`${PUBLIC_API_URL}/${endPoint}`, data, config, onError);
};

export const postToExternal = async <TResponse, TError = unknown>(
	endPoint: string,
	data: Record<string, any> = {},
	config: RequestInit = {},
	onError: ErrorHandler | undefined = undefined
) => {
	return genericPost<TResponse, TError>(`${PUBLIC_API_URL}/${endPoint}`, data, config, onError);
};

export const handleUnauthenticatedUser = async () => {
	if (browser) {
		await invalidateAll();
		await goto('/user/logout?session-expired=true');
		return;
	} else {
		redirect(303, '/user/logout?session-expired=true');
	}
};

const _defaultUnAuthenticatedUserHandler = async <
	TSchema extends z.AnyZodObject,
	TErrorCallbackResult extends Promise<unknown>
>(
	errorCallback: Required<
		ServiceCallOptions<never, TSchema, TErrorCallbackResult>
	>['errorCallback'],
	e: Extract<ServiceError<TSchema>, { type: ErrorType.NOT_AUTHENTICATED }>
): Promise<{
	success: false;
	error: Awaited<TErrorCallbackResult>;
}> => {
	const result = await errorCallback(e);
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
	PRE_REQUEST_FAILURE,
	SERVICE_DOWN_ERROR,
	UNKNOWN_ERROR,
	NOT_AUTHENTICATED
}

export type ServiceError<TErrorSchema extends z.AnyZodObject> =
	| {
			type: ErrorType.VALIDATION_ERROR;
			message: ErrorMessage;
			status: number;
			code: Extract<ErrorCode, 'invalid_input'>;
			validationError: TErrorSchema extends z.AnyZodObject ? z.infer<TErrorSchema> : never;
			response: Record<string, any>;
			originalError: ResponseError;
	  }
	| {
			type: ErrorType.API_ERROR;
			message: string;
			status: number;
			code: ErrorCode;
			response: Record<string, any>;
			originalError: ResponseError;
	  }
	| {
			type: ErrorType.SERVICE_DOWN_ERROR;
			message: 'Service is temporarily down, please try again later';
			status: 503;
			data: never;
			originalError: FetchError;
	  }
	| {
			type: ErrorType.PRE_REQUEST_FAILURE;
			message: ErrorMessage;
			status: 400;
			data: unknown;
			originalError: FetchError | RequiredError;
	  }
	| {
			type: ErrorType.UNKNOWN_ERROR;
			message: ErrorMessage;
			status: number;
			originalError: unknown;
	  }
	| {
			type: ErrorType.NOT_AUTHENTICATED;
			message: ErrorMessage;
			status: number;
			data: unknown;
			preventDefaultHandler: boolean;
			originalError: ResponseError | TokenError;
	  };

export type ServiceCallOptions<
	TServiceCallResult extends Promise<unknown>,
	TErrorSchema extends z.AnyZodObject,
	TErrorCallbackResult extends Promise<unknown>
> = {
	serviceCall: () => TServiceCallResult;
	errorSchema?: TErrorSchema;
	errorCallback?: (e: ServiceError<TErrorSchema>) => TErrorCallbackResult;
};

export async function callService<
	TServiceCallResult extends Promise<unknown>,
	TErrorSchema extends z.AnyZodObject,
	TErrorCallbackResult extends Promise<unknown> = Promise<ServiceError<TErrorSchema>>
>({
	serviceCall,
	errorSchema,
	errorCallback = (async (e) => {
		if (e.type === ErrorType.NOT_AUTHENTICATED) {
			await handleUnauthenticatedUser();
		}
		return e;
	}) as Required<
		ServiceCallOptions<TServiceCallResult, TErrorSchema, TErrorCallbackResult>
	>['errorCallback']
}: ServiceCallOptions<TServiceCallResult, TErrorSchema, TErrorCallbackResult>): Promise<
	| {
			success: false;
			error: Awaited<TErrorCallbackResult>;
	  }
	| {
			success: true;
			response: Awaited<TServiceCallResult>;
	  }
> {
	try {
		return {
			success: true,
			response: await serviceCall()
		};
	} catch (e) {
		console.error(e);
		if (e instanceof FetchError) {
			return {
				success: false,
				error: await errorCallback({
					type: ErrorType.SERVICE_DOWN_ERROR,
					status: 503,
					message: 'Service is temporarily down, please try again later',
					data: e as never,
					originalError: e
				})
			};
		}

		if (e instanceof RequiredError) {
			return {
				success: false,
				error: await errorCallback({
					type: ErrorType.PRE_REQUEST_FAILURE,
					status: 400,
					message: e.message,
					data: e,
					originalError: e
				})
			};
		}

		if (e instanceof ResponseError) {
			let response: any;

			try {
				response = await e.response.clone().json();
			} catch {
				return {
					success: false,
					error: await errorCallback({
						type: ErrorType.API_ERROR,
						status: e.response.status < 400 ? 500 : e.response.status,
						code: ErrorCode.UnknownError,
						message:
							e.response.status < 400
								? 'Service response was in an unexpected format'
								: e.response.statusText,
						response: response,
						originalError: e
					})
				};
			}

			if (e.response.status === 401) {
				return await _defaultUnAuthenticatedUserHandler(errorCallback, {
					type: ErrorType.NOT_AUTHENTICATED,
					status: e.response.status,
					message: 'Invalid credentials!',
					data: response,
					preventDefaultHandler: false,
					originalError: e
				});
			}

			// TODO: this is HTTPValidationError fix types based on this
			const parsedApiError = await errorSchema?.strip().partial().safeParseAsync(response.detail);
			if (parsedApiError?.success) {
				return {
					success: false,
					error: await errorCallback({
						type: ErrorType.VALIDATION_ERROR,
						status: e.response.status,
						code: ErrorCode.InvalidInput,
						message: e.message,
						response: response,
						validationError: parsedApiError.data as any,
						originalError: e
					})
				};
			}

			const userFriendlyError = await UserFriendlyErrorSchema.safeParseAsync(response);
			if (userFriendlyError.success) {
				return {
					success: false,
					error: await errorCallback({
						type: ErrorType.API_ERROR,
						status: e.response.status,
						code: userFriendlyError.data.code,
						message: userFriendlyError.data.message,
						response: response,
						originalError: e
					})
				};
			}
			return {
				success: false,
				error: await errorCallback({
					type: ErrorType.API_ERROR,
					status: e.response.status,
					code: ErrorCode.UnknownError,
					message: response?.message ?? e.message,
					response: response,
					originalError: e
				})
			};
		}

		if (e instanceof TokenError) {
			return await _defaultUnAuthenticatedUserHandler(errorCallback, {
				type: ErrorType.NOT_AUTHENTICATED,
				status: 401,
				message: e.message,
				data: { detail: 'Invalid token (client-side validations).' },
				preventDefaultHandler: false,
				originalError: e
			});
		}

		return {
			success: false,
			error: await errorCallback({
				type: ErrorType.UNKNOWN_ERROR,
				status: 500,
				message: 'An unknown error has occurred, please try again',
				originalError: e
			})
		};
	}
}
