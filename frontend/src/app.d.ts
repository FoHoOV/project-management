// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { Token } from '#lib/generated-client/index.js';
import type { SHARED_KEYS } from '#lib/constants/cookie.js';

declare global {
	namespace App {
		interface Locals {
			token?: Token;
			sharedCookies: Record<(typeof SHARED_KEYS)[keyof typeof SHARED_KEYS], string | undefined>;
		}

		interface PageData {
			username?: string;
		}
		// interface Platform {}
	}
}

export {};
