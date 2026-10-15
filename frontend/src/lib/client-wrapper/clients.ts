import { PUBLIC_API_REQUEST_TIMEOUT_MS, PUBLIC_API_URL } from '$env/static/public';
import { type Client, createClient, createConfig } from '$lib/generated-client/client';
import type { Token } from '$lib/generated-client';
import { TokenError, isTokenExpirationDateValidAsync } from '$lib/utils/token';

const REQUEST_TIMEOUT_MS = parseInt(PUBLIC_API_REQUEST_TIMEOUT_MS);

/**
 * Every failed request made through {@link createApiClient} rejects with this error.
 * `response` is only set when the server answered with an HTTP error; otherwise `body` holds
 * the thrown cause (e.g. a {@link TokenError}, a network `TypeError` or a timeout).
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
	token?: Token;
	fetch?: typeof fetch;
};

/**
 * The generated SDK's types assume `throwOnError: true` (see `openapi-ts.config.ts`): a call
 * resolves to the response body or rejects with an {@link ApiError}. Build one per request, never
 * at module level: on the server, module state is shared by every user's requests.
 */
export function createApiClient({ token, fetch: fetchApi = fetch }: ApiClientOptions = {}): Client {
	const client = createClient(
		createConfig({
			baseUrl: PUBLIC_API_URL,
			fetch: fetchApi,
			throwOnError: true,
			auth: async () => {
				if (!token?.access_token) {
					throw new TokenError('token required');
				}
				if (!(await isTokenExpirationDateValidAsync(token.access_token))) {
					throw new TokenError('token has expired');
				}
				return token.access_token;
			}
		})
	);

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
