import type { LayoutServerLoad } from './$types';
import { callService } from '$lib/client-wrapper';
import { ProjectClient } from '$lib/client-wrapper/clients';
import type { Project } from '$lib/generated-client/models';
import { error, type Cookies } from '@sveltejs/kit';
import { SHARED_KEYS } from '$lib/constants/cookie';
import { convertNumberToHttpStatusCode } from '$lib';

function getSharedCookies(cookie: Cookies) {
	const result = {} as Record<keyof typeof SHARED_KEYS, string | undefined>;
	for (const [key, value] of Object.entries(SHARED_KEYS)) {
		result[key as keyof typeof SHARED_KEYS] = cookie.get(value);
	}
	return result;
}

export const load = (async ({ locals, cookies }) => {
	let result: Project[] = [];
	if (locals.token) {
		const projects = await callService({
			call: async () => {
				return await ProjectClient({ fetchApi: fetch, token: locals.token }).listProject();
			}
		});
		if (!projects.success) {
			error(convertNumberToHttpStatusCode(projects.error.status), projects.error.message);
		}
		result = projects.response;
	}

	return {
		token: locals.token,
		projects: result,
		sharedCookies: getSharedCookies(cookies)
	};
}) satisfies LayoutServerLoad;
