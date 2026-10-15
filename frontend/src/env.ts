import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	PUBLIC_API_URL: { public: true, static: true },
	PUBLIC_COOKIES_EXPIRATION_SPAN_SECONDS: { public: true, static: true },
	PUBLIC_API_REQUEST_TIMEOUT_MS: { public: true, static: true }
});
