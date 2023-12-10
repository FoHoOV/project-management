import { error } from '@sveltejs/kit';
import { callService } from '$lib/client-wrapper';
import { ProjectClient } from '$lib/client-wrapper/clients';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const result = await callService({
		serviceCall: async () => {
			return await ProjectClient({ fetchApi: fetch, token: locals.token }).listProject();
		}
	});

	if (!result.success) {
		throw error(result.error.status, result.error.message);
	}

	return { projects: result.response };
}) satisfies LayoutServerLoad;
