import type { PageServerLoad } from './$types';
import { ProjectClient } from '$lib/client-wrapper/clients';
import { callService } from '$lib/client-wrapper';
import { error } from '@sveltejs/kit';

export const load = (async ({ locals, fetch }) => {
	const result = await callService({
		serviceCall: async () => {
			return await ProjectClient({ fetchApi: fetch, token: locals.token }).listProject();
		}
	});

	if (!result.success) {
		throw error(result.error.status, result.error.message);
	}

	return { projects: result.response };
}) satisfies PageServerLoad;
