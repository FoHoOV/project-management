import type { LayoutServerLoad } from './$types';
import { callService } from '$lib/client-wrapper';
import { ProjectClient } from '$lib/client-wrapper/clients';
import type { Project } from '$lib/generated-client/models';
import { error } from '@sveltejs/kit';
export const load = (async ({ locals }) => {
	let result: Project[] = [];
	if (locals.token) {
		const projects = await callService({
			serviceCall: async () => {
				return await ProjectClient({ fetchApi: fetch, token: locals.token }).listProject();
			}
		});
		if (!projects.success) {
			throw error(projects.error.status, projects.error.message);
		}
		result = projects.response;
	}

	return { token: locals.token, projects: result };
}) satisfies LayoutServerLoad;
