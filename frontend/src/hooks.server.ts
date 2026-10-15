import type { Token } from '#lib/generated-client/index.js';
import { SERVER_ONLY_KEYS } from '#lib/constants/cookie.server.js';
import { sequence, type Handle, type HandleServerError } from '@sveltejs/kit/hooks';
import { isTokenExpired } from '#lib/utils/token/index.js';
import { SHARED_KEYS } from '#lib/constants/cookie.js';

export const setSharedCookies: Handle = async ({ event, resolve }) => {
	const result = {} as Record<(typeof SHARED_KEYS)[keyof typeof SHARED_KEYS], string | undefined>;
	for (const value of Object.values(SHARED_KEYS)) {
		result[value] = event.cookies.get(value);
	}
	event.locals.sharedCookies = result;
	return await resolve(event);
};

export const setAuthorizationToken: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(SERVER_ONLY_KEYS.token);

	if (token) {
		let parsedToken: Token | undefined = undefined;

		try {
			parsedToken = JSON.parse(token) as Token;
			if (isTokenExpired(parsedToken.access_token)) {
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

export const handleError: HandleServerError = ({ kind }) => {
	if (kind === 'unknown') {
		return { message: 'Whoops! an unknown error has occurred, please try again later' };
	}
};

export const handle: Handle = sequence(setSharedCookies, setAuthorizationToken);
