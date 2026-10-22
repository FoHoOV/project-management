import { PUBLIC_API_REQUEST_TIMEOUT_MS } from '$app/env/public';
import { type Client, createClient, createConfig } from '#lib/generated-client/client/index.js';

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

/**
 * Builds a client that calls the backend through the `/api` proxy route, which adds the user's
 * token from the cookie. Import `createApiClient` from `#lib/api-client.js` instead of calling this.
 *
 * The generated SDK's types assume `throwOnError: true` (see `openapi-ts.config.ts`): a call
 * resolves to the response body or rejects with an {@link ApiError}.
 */
export function buildApiClient(config: { baseUrl: string; fetch?: typeof fetch }): Client {
	const client = createClient(createConfig({ ...config, throwOnError: true }));

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
