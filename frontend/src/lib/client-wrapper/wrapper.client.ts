import type { ZodRawShape, z } from 'zod';
import { type ServiceCallOptions, callService, type ServiceError } from './wrapper.universal';

export async function callServiceInClient<
	TServiceCallResult extends Promise<unknown>,
	TErrorSchema extends z.ZodObject,
	TErrorCallbackResult extends Promise<unknown> = Promise<ServiceError<TErrorSchema>>
>({
	call,
	errorSchema,
	errorHandler
}: ServiceCallOptions<TServiceCallResult, TErrorSchema, TErrorCallbackResult>) {
	return await callService({
		call,
		errorSchema,
		errorHandler
	});
}
