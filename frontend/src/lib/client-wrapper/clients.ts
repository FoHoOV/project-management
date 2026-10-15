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

type ApiClientOptions = {
	/** SvelteKit's event `fetch` on the server (it handles `/api` in-process with the cookies). */
	fetch: typeof globalThis.fetch;
	/** The current page's URL. The client builds absolute URLs: Node rejects `new Request('/api')`. */
	url: URL;
};

/**
 * Calls the backend through the `/api` proxy route, which adds the user's token from the cookie.
 * Build one per request: on the server, a module-level client would hold another request's `fetch`.
 *
 * The generated SDK's types assume `throwOnError: true` (see `openapi-ts.config.ts`): a call
 * resolves to the response body or rejects with an {@link ApiError}.
 */
export function createApiClient({ fetch, url }: ApiClientOptions): Client {
	const baseUrl = new URL(API_PROXY_PATH, url).href;
	const client = createClient(createConfig({ baseUrl, fetch, throwOnError: true }));

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
