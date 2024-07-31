import { error } from '@sveltejs/kit';
import { callService } from '$lib/client-wrapper/wrapper.universal';
import { TodoCategoryClient } from '$lib/client-wrapper/clients';
import { convertNumberToHttpStatusCode } from '$lib/utils';
import type { PageLoad } from './$types';

export const load = (async ({ parent, fetch, params }) => {
	return await callService({
		call: async () => {
			return await TodoCategoryClient({
				token: (await parent()).token,
				fetchApi: fetch
			}).searchTodoCategories(Number.parseInt(params.project_id));
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
