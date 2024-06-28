import { redirect, type Actions, type Cookies } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { SERVER_ONLY_KEYS } from '$lib/constants/cookie.server';

function logout(cookies: Cookies) {
	cookies.delete(SERVER_ONLY_KEYS.token, { path: '/' });
	redirect(307, '/login');
}

export const load = (async ({ cookies, url }) => {
	if (url.searchParams.get('session-expired') === 'true') {
		logout(cookies);
	}
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ cookies }) => {
		logout(cookies);
	}
} satisfies Actions;
