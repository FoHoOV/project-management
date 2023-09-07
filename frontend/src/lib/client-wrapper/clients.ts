import { PUBLIC_API_URL } from '$env/static/public';
import { decodeJwt, type JWTPayload } from 'jose';
import { OAuthApi, TodoApi, UserApi } from '../client/apis';

import {
	BaseAPI,
	Configuration,
	type ConfigurationParameters,
	type RequestContext
} from '../client/runtime';
import type { Token } from '../client/models';

export class TokenError extends Error {
	constructor(message: string) {
		super(message);
	}
}

export async function isTokenExpirationDateValidAsync(token?: string) {
	if (!token) {
		return false;
	}
	try {
		const parsedToken: JWTPayload = decodeJwt(token);
		if (!parsedToken.exp) {
			throw new TokenError('expiration token not found in jwt');
		}
		if (parsedToken.exp * 1000 < Date.now()) {
			return false;
		}
	} catch {
		return false;
	}

	return true;
}

const checkAccessToken = async (context: RequestContext, config?: ConfigurationOptions) => {
	if (config?.isTokenRequired === false) {
		return;
	}

	const headers = context.init.headers ? new Headers(context.init.headers) : new Headers();

	if (!config?.token?.access_token) {
		throw new TokenError('token required');
	}

	if (!(await isTokenExpirationDateValidAsync(config.token.access_token))) {
		throw new TokenError('token has expired');
	}

	headers.set('Authorization', `${config.token?.token_type ?? 'bearer'} ${config.token.access_token}`);

	context.init.headers = headers;
};

type ConfigurationOptions = Partial<Omit<ConfigurationParameters, 'accessToken'>> & {
	token?: Token;
	isTokenRequired?: boolean;
};

export const generateClient = <T extends typeof BaseAPI>(ApiClass: T, config?: ConfigurationOptions): InstanceType<T> => {
	return new ApiClass(
		new Configuration({
			basePath: PUBLIC_API_URL
		})
	).withPreMiddleware(async (context) => {
		return await checkAccessToken(context, config);
	}) as InstanceType<T>;
};

export const OAuthClient = (config: ConfigurationOptions = { isTokenRequired: true }) => {
	return generateClient(OAuthApi, config);
};

export const TodoClient = (config?: ConfigurationOptions) => {
	return generateClient(TodoApi, config);
};

export const UserClient = (config?: ConfigurationOptions) => {
	return generateClient(UserApi, config);
};
