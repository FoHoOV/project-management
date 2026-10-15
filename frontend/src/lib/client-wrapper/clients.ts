import { PUBLIC_API_REQUEST_TIMEOUT_MS } from '$env/static/public';
import { type Client, type Config, createClient, createConfig } from '$lib/generated-client/client';

export const API_PROXY_PATH = '/api';

export const REQUEST_TIMEOUT_MS = parseInt(PUBLIC_API_REQUEST_TIMEOUT_MS);

/**
 * Every failed request made through an API client rejects with this error.
 * `response` is only set when the server answered with an HTTP error; otherwise `body` holds
 * the thrown cause (e.g. a `TokenError`, a network `TypeError` or a timeout).
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
 * The generated SDK's types assume `throwOnError: true` (see `openapi-ts.config.ts`): a call
 * resolves to the response body or rejects with an {@link ApiError}. Build one per request, never
 * at module level: on the server, module state is shared by every user's requests.
 */
export function buildApiClient(config: Pick<Config, 'baseUrl' | 'fetch' | 'auth'>): Client {
	const client = createClient(createConfig({ ...config, throwOnError: true }));

	// The timeout goes on the request itself: SvelteKit's server-side `fetch` ignores the `init`
	// argument when it is given a `Request`.
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

/**
 * For browser code. Requests go through the `/api` proxy route, which adds the token from the
 * `httpOnly` cookie, so the browser never sees it.
 */
export function createApiClient(): Client {
	return buildApiClient({ baseUrl: API_PROXY_PATH });
}
