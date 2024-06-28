import type { Handle, HandleServerError } from '@sveltejs/kit';
import type { Token } from '$lib/generated-client';
import { SERVER_ONLY_KEYS } from '$lib/constants/cookie.server';
import { sequence } from '@sveltejs/kit/hooks';
import { isTokenExpirationDateValidAsync } from '$lib/utils/token';

export const setAuthorizationToken: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(SERVER_ONLY_KEYS.token);

	if (token) {
		let parsedToken: Token | undefined = undefined;

		try {
			parsedToken = JSON.parse(token) as Token;
			if (!(await isTokenExpirationDateValidAsync(parsedToken.access_token))) {
				event.cookies.delete(SERVER_ONLY_KEYS.token, { path: '/' });
				parsedToken = undefined;
			}
		} catch (e) {
			event.cookies.delete(SERVER_ONLY_KEYS.token, { path: '/' });
		}

		event.locals.token = parsedToken;
	}

	return await resolve(event);
};

export const handleUnexpectedError: HandleServerError = async ({ status }) => {
	return {
		message: 'Whoops! an unknown error has occurred, please try again later',
		status: status
	};
};

export const handle: Handle = sequence(setAuthorizationToken);
