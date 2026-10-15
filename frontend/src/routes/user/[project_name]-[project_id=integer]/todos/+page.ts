import { error } from '@sveltejs/kit';
import { callService } from '$lib/client-wrapper/wrapper.universal';
import { createApiClient } from '$lib/client-wrapper/clients';
import { searchTodoCategories } from '$lib/generated-client';
import { convertNumberToHttpStatusCode } from '$lib/utils';
import type { PageLoad } from './$types';

export const load = (async ({ parent, fetch, params }) => {
	return await callService({
		call: async () => {
			const { data } = await searchTodoCategories({
				client: createApiClient({ token: (await parent()).token, fetch }),
				query: { project_id: Number.parseInt(params.project_id) },
				throwOnError: true
			});
			return data;
		},
		errorHandler: async (e) => {
			if (e.status == 401) {
				return; // allow default unauthenticated user handling
			}
			error(convertNumberToHttpStatusCode(e.status), {
				message: 'An error occurred while fetching your todos!'
			});
		}
	});
}) satisfies PageLoad;
