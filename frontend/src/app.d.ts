// See https://kit.svelte.dev/docs/types#app

import type { Token } from '$lib/client';

// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			data?: Record<string, any>;
		}
		interface Locals {
			token?: Token;
		}
		
		interface PageData {
			token?: Token;
		}
		// interface Platform {}
	}
}

declare module '@fortawesome/pro-solid-svg-icons/index.es' {
	export * from '@fortawesome/pro-solid-svg-icons';
}
declare module '@fortawesome/free-regular-svg-icons/index.es' {
	export * from '@fortawesome/free-regular-svg-icons';
}
declare module '@fortawesome/free-solid-svg-icons/index.es' {
	export * from '@fortawesome/free-solid-svg-icons';
}

export {};
