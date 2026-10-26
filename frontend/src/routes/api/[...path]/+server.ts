import { PUBLIC_API_URL } from '$app/env/public';
import { error } from '@sveltejs/kit';
import { API_PROXY_PATH, REQUEST_TIMEOUT_MS } from '#lib/client-wrapper/clients.js';
import type { RequestHandler } from './$types';

// The backend's paths end in `/` (e.g. `/projects/`); keep them as they are.
export const trailingSlash = 'ignore';

const FORWARDED_REQUEST_HEADERS = ['accept', 'content-type'];
const FORWARDED_RESPONSE_HEADERS = ['content-type'];
const METHODS_WITHOUT_BODY = ['GET', 'HEAD'];

function pickHeaders(headers: Headers, names: string[]) {
	const picked = new Headers();
	for (const name of names) {
		const value = headers.get(name);
		if (value !== null) {
			picked.set(name, value);
		}
	}
	return picked;
}

/**
 * Forwards browser requests to the backend with the token from the `httpOnly` cookie, so the
 * token never reaches the browser.
 */
export const fallback: RequestHandler = async ({ request, url, locals, fetch }) => {
	const hasBody = !METHODS_WITHOUT_BODY.includes(request.method);

	// The cookie is sent with any request to this origin, so only this origin may change data.
	if (hasBody && request.headers.get('origin') !== url.origin) {
		error(403, 'Cross-origin requests are not allowed');
	}

	const headers = pickHeaders(request.headers, FORWARDED_REQUEST_HEADERS);
	if (locals.token) {
		headers.set('authorization', `Bearer ${locals.token.access_token}`);
	}

	let response: Response;
	try {
		response = await fetch(
			`${PUBLIC_API_URL}${url.pathname.slice(API_PROXY_PATH.length)}${url.search}`,
			{
				method: request.method,
				headers,
				body: hasBody ? await request.arrayBuffer() : undefined,
				signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
			}
		);
	} catch (e) {
		return e instanceof DOMException && e.name === 'TimeoutError'
			? Response.json({ message: 'Request timed out, please try again' }, { status: 504 })
			: Response.json(
					{ message: 'Service is temporarily down, please try again later' },
					{ status: 502 }
				);
	}

	return new Response(response.body, {
		status: response.status,
		headers: pickHeaders(response.headers, FORWARDED_RESPONSE_HEADERS)
	});
};
