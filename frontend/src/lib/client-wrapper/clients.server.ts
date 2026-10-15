import { PUBLIC_API_URL } from '$env/static/public';
import type { Client } from '$lib/generated-client/client';
import type { Token } from '$lib/generated-client';
import { TokenError } from '$lib/utils/token';
import { buildApiClient } from './clients';

type ServerApiClientOptions = {
	/** `locals.token`; `hooks.server.ts` has already dropped it if it expired. */
	token?: Token;
	/** The `fetch` of the SvelteKit event. */
	fetch: typeof fetch;
};

/** For load functions and form actions: calls the backend directly with the user's token. */
export function createServerApiClient({ token, fetch }: ServerApiClientOptions): Client {
	return buildApiClient({
		baseUrl: PUBLIC_API_URL,
		fetch,
		auth: () => {
			if (!token) {
				throw new TokenError('token required');
			}
			return token.access_token;
		}
	});
}
