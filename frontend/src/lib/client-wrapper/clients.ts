import { PUBLIC_API_REQUEST_TIMEOUT_MS } from '$env/static/public';
import { type Client, createClient, createConfig } from '$lib/generated-client/client';

export const API_PROXY_PATH = '/api';

export const REQUEST_TIMEOUT_MS = parseInt(PUBLIC_API_REQUEST_TIMEOUT_MS);

/**
 * Every failed request made through an API client rejects with this error.
 * `response` is only set when the server answered with an HTTP error; otherwise `body` holds
 * the thrown cause (e.g. a network `TypeError` or a timeout).
 */
export class ApiError extends Error {
	constructor(
		readonly body: unknown,
		readonly response: Response | undefined
	) {
		super(response ? `request failed with status ${response.status}` : 'request failed');
	}
}

// The generated client builds a `Request` before calling `fetch`, and Node rejects relative URLs
// such as `/api/...`. On the server, requests get this placeholder origin, which is stripped
// again before they reach SvelteKit's `fetch`.
const SERVER_PLACEHOLDER_ORIGIN = 'http://sveltekit.internal';

function withoutPlaceholderOrigin(eventFetch: typeof fetch): typeof fetch {
	return async (input) => {
		const request = input as Request;
		return eventFetch(request.url.slice(SERVER_PLACEHOLDER_ORIGIN.length), {
			method: request.method,
			headers: request.headers,
			body: request.body ? await request.arrayBuffer() : undefined,
			signal: request.signal
		});
	};
}

/**
 * Calls the backend through the `/api` proxy route, which adds the user's token from the cookie.
 * Browser code calls it without arguments. Server code passes the event's `fetch`, which handles
 * `/api` in-process and forwards the cookies; build one per request there.
 *
 * The generated SDK's types assume `throwOnError: true` (see `openapi-ts.config.ts`): a call
 * resolves to the response body or rejects with an {@link ApiError}.
 */
export function createApiClient(eventFetch?: typeof fetch): Client {
	const baseUrl = eventFetch ? SERVER_PLACEHOLDER_ORIGIN + API_PROXY_PATH : API_PROXY_PATH;
	const fetchApi = eventFetch ? withoutPlaceholderOrigin(eventFetch) : undefined;
	const client = createClient(createConfig({ baseUrl, fetch: fetchApi, throwOnError: true }));

	client.interceptors.request.use((request, options) =>
		options.signal
			? request
			: new Request(request, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
	);
	client.interceptors.error.use(
		(error, response) => new ApiError(error, response?.ok === false ? response : undefined)
	);

	return client;
}
