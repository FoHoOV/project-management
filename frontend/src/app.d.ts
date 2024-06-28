// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { Token } from '$lib/generated-client/models';

import 'vitest-dom/extend-expect';

declare global {
	namespace App {
		interface Error {
			data?: Record<string, any>;
		}
		interface Locals {
			token?: Token;
			sharedCookies: Record<(typeof SHARED_KEYS)[keyof typeof SHARED_KEYS], string | undefined>;
		}

		interface PageData {
			token?: Token;
		}
		// interface Platform {}
	}
}

export {};
