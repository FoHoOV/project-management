import type { ZodRawShape, z } from 'zod';
import {
	genericGet,
	type ErrorHandler,
	genericPost,
	type ServiceCallOptions,
	callService,
	type ServiceError
} from './wrapper.universal';

export const getToSvelte = async <TResponse, TError = unknown>(
	endPoint: string,
	data: Record<string, any> = {},
	config: RequestInit = {},
	onError: ErrorHandler | undefined = undefined
) => {
	return genericGet<TResponse, TError>(endPoint, data, config, onError);
};

export const postToSvelte = async <TResponse, TError = unknown>(
	endPoint: string,
	data: Record<string, any> = {},
	config: RequestInit = {},
	onError: ErrorHandler | undefined = undefined
) => {
	return genericPost<TResponse, TError>(endPoint, data, config, onError);
};

export async function callServiceInClient<
	TServiceCallResult extends Promise<unknown>,
	TErrorSchema extends z.AnyZodObject,
	TErrorCallbackResult extends Promise<unknown> = Promise<ServiceError<TErrorSchema>>
>({
	serviceCall,
	errorSchema,
	errorCallback
}: ServiceCallOptions<TServiceCallResult, TErrorSchema, TErrorCallbackResult>) {
	return await callService({
		serviceCall: serviceCall,
		errorSchema: errorSchema,
		errorCallback: errorCallback
	});
}
