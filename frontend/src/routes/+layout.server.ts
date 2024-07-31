import type { LayoutServerLoad } from './$types';
import { callService } from '$lib/client-wrapper';
import { ProjectClient } from '$lib/client-wrapper/clients';
import type { Project } from '$lib/generated-client/models';
import { error } from '@sveltejs/kit';
import { convertNumberToHttpStatusCode } from '$lib';

export const load = (async ({ locals }) => {
	let result: Project[] = [];
	if (locals.token) {
		const projects = await callService({
			call: async () => {
				return await ProjectClient({ fetchApi: fetch, token: locals.token }).listProjects();
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
		sharedCookies: locals.sharedCookies
	};
}) satisfies LayoutServerLoad;
