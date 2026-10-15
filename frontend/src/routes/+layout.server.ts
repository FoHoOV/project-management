import type { LayoutServerLoad } from './$types';
import { callService } from '#lib/client-wrapper/index.js';
import { createServerApiClient } from '#lib/client-wrapper/clients.server.js';
import { listProjects } from '#lib/generated-client/index.js';
import type { Project } from '#lib/generated-client/index.js';
import { error } from '@sveltejs/kit';
import { convertNumberToHttpStatusCode, getUsername } from '#lib';

export const load = (async ({ locals }) => {
	let result: Project[] = [];
	if (locals.token) {
		const projects = await callService({
			call: async () => {
				return await listProjects({
					client: createServerApiClient()
				});
			}
		});
		if (!projects.success) {
			error(convertNumberToHttpStatusCode(projects.error.status), projects.error.message);
		}
		result = projects.response;
	}

	return {
		username: locals.token ? getUsername(locals.token.access_token) : undefined,
		projects: result,
		sharedCookies: locals.sharedCookies
	};
}) satisfies LayoutServerLoad;
