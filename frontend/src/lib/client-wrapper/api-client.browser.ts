import type { Client } from '#lib/generated-client/client/index.js';
import { API_PROXY_PATH, buildApiClient } from './clients.js';

export function createApiClient(): Client {
	return buildApiClient({ baseUrl: API_PROXY_PATH });
}
