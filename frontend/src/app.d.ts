// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { Token, User } from '#lib/generated-client/index.js';

import '@testing-library/jest-dom/vitest';

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
			username?: string;
		}
		// interface Platform {}
	}
}

export {};
