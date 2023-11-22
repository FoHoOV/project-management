import { PUBLIC_API_URL } from '$env/static/public';
import {
	OAuthApi,
	TodoItemApi,
	TodoCategoryApi,
	UserApi,
	ProjectApi
} from '$lib/generated-client/apis';

import {
	BaseAPI,
	Configuration,
	type ConfigurationParameters,
	type RequestContext
} from '$lib/generated-client/runtime';
import type { Token } from '$lib/generated-client/models';
import { TokenError, isTokenExpirationDateValidAsync } from '$lib/utils/token';

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

	headers.set(
		'Authorization',
		`${config.token?.token_type ?? 'bearer'} ${config.token.access_token}`
	);

	context.init.headers = headers;
};

type ConfigurationOptions = Partial<Omit<ConfigurationParameters, 'accessToken'>> & {
	token?: Token;
	isTokenRequired?: boolean;
};

export const generateClient = <T extends typeof BaseAPI>(
	ApiClass: T,
	config?: ConfigurationOptions
): InstanceType<T> => {
	return new ApiClass(
		new Configuration({
			basePath: PUBLIC_API_URL,
			...(config ?? {})
		})
	).withPreMiddleware(async (context) => {
		return await checkAccessToken(context, config);
	}) as InstanceType<T>;
};

export const OAuthClient = (config: ConfigurationOptions = { isTokenRequired: true }) => {
	return generateClient(OAuthApi, config);
};

export const TodoItemClient = (config?: ConfigurationOptions) => {
	return generateClient(TodoItemApi, config);
};

export const TodoCategoryClient = (config?: ConfigurationOptions) => {
	return generateClient(TodoCategoryApi, config);
};

export const ProjectClient = (config?: ConfigurationOptions) => {
	return generateClient(ProjectApi, config);
};

export const UserClient = (config?: ConfigurationOptions) => {
	return generateClient(UserApi, config);
};
