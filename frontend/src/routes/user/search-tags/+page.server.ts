import { namedActionResult, validateFormActionRequest } from '#lib';
import { createApiClient } from '#lib/api-client.js';
import { searchTags } from '#lib/generated-client/index.js';
import type { Actions } from './$types';
import { searchTagSchema } from './validator';
import { callServiceInFormActions } from '#lib/client-wrapper/wrapper.server.js';

export const actions = {
	search: async ({ request }) => {
		const validation = await validateFormActionRequest(request, searchTagSchema);

		if (!validation.success) {
			return validation.failure;
		}

		const result = await callServiceInFormActions({
			call: async () => {
				return await searchTags({
					client: createApiClient(),
					query: validation.data
				});
			},
			errorSchema: searchTagSchema
		});

		return namedActionResult(result, 'search');
	}
} satisfies Actions;
