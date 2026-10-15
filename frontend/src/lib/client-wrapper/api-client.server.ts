import { getRequestEvent } from '$app/server';
import type { Client } from '#lib/generated-client/client/index.js';
import { API_PROXY_PATH, buildApiClient } from './clients.js';

/**
 * For load functions and form actions. Uses the current request's `fetch`, which handles `/api`
 * in-process and forwards the user's cookies. The URL is absolute because the generated client
 * builds a `Request` first, and Node rejects relative URLs.
 */
export function createApiClient(): Client {
	const { fetch, url } = getRequestEvent();
	return buildApiClient({ baseUrl: `${url.origin}${API_PROXY_PATH}`, fetch });
}
