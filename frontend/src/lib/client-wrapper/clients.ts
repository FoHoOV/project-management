import { PUBLIC_API_REQUEST_TIMEOUT_MS, PUBLIC_API_URL } from '$env/static/public';
import { type Client, createClient, createConfig } from '$lib/generated-client/client';
import type { Token } from '$lib/generated-client';
import { TokenError, isTokenExpirationDateValidAsync } from '$lib/utils/token';

/**
 * Every failed request made through {@link createApiClient} rejects with this error.
 * `response` is only set when the server answered (HTTP error); otherwise `body` holds
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

export function createApiClient({ token, fetch: fetchApi = fetch }: ApiClientOptions = {}): Client {
	const client = createClient(
		createConfig({
			baseUrl: PUBLIC_API_URL,
			fetch: addTimeoutToFetchIfNotExists(fetchApi, parseInt(PUBLIC_API_REQUEST_TIMEOUT_MS)),
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

	client.interceptors.error.use((error, response) => new ApiError(error, response));

	return client;
}

/**
 *  @param timeout timeout in milliseconds
 */
export const addTimeoutToFetchIfNotExists = (fetchApi: typeof fetch, timeout: number) => {
	return (input: RequestInfo | URL, init?: RequestInit) => {
		if (!init?.signal) {
			const controller = new AbortController();
			setTimeout(() => {
				controller.abort();
			}, timeout);

			init = { ...init, signal: controller.signal };
		}

		return fetchApi(input, init);
	};
};
