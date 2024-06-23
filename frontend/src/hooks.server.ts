import type { Handle, HandleServerError } from '@sveltejs/kit';
import type { Token } from '$lib/generated-client';
import KEYS from '$lib/constants/cookie';
import { sequence } from '@sveltejs/kit/hooks';
import { isTokenExpirationDateValidAsync } from '$lib/utils/token';
import { StorageTypes } from './lib';

export const setServerSideCookieManager: Handle = async ({ event, resolve }) => {
	// doing this might not be good, it might access other sessions? if doesn't take the
	// current request as param internally, I might be f'ed
	StorageTypes.cookieManager = {
		set: event.cookies.set,
		get: event.cookies.get
	};
	return await resolve(event);
};

export const setAuthorizationToken: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(KEYS.token);

	if (token) {
		let parsedToken: Token | undefined = undefined;

		try {
			parsedToken = JSON.parse(token) as Token;
			if (!(await isTokenExpirationDateValidAsync(parsedToken.access_token))) {
				event.cookies.delete(KEYS.token, { path: '/' });
				parsedToken = undefined;
			}
		} catch (e) {
			event.cookies.delete(KEYS.token, { path: '/' });
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

export const handle: Handle = sequence(setServerSideCookieManager, setAuthorizationToken);
