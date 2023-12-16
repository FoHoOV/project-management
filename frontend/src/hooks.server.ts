import type { Handle } from '@sveltejs/kit';
import type { Token } from '$lib/generated-client';
import KEYS from '$lib/constants/cookie';
import { sequence } from '@sveltejs/kit/hooks';
import { isTokenExpirationDateValidAsync } from '$lib/utils/token';

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

export const handle: Handle = sequence(setAuthorizationToken);
