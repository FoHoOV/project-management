import {
	callServiceInFormActions,
	convertFormDataToObject,
	namedActionResult,
	superFail
} from '$lib';
import { TagClient } from '$lib/client-wrapper/clients';
import type { Actions, PageServerLoad } from './$types';
import { searchTagSchema } from './validator';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions = {
	search: async ({ request, locals, fetch }) => {
		const formData = await request.formData();

		const validationsResult = await searchTagSchema.safeParseAsync({
			...convertFormDataToObject(formData)
		});

		if (!validationsResult.success) {
			return superFail(400, {
				message: 'Invalid form, please review your inputs',
				error: validationsResult.error.flatten().fieldErrors
			});
		}

		const result = await callServiceInFormActions({
			serviceCall: async () => {
				if (validationsResult.data.projectId) {
					return await TagClient({
						token: locals.token,
						fetchApi: fetch
					}).searchTag(validationsResult.data.name, validationsResult.data.projectId);
				} else {
					return await TagClient({
						token: locals.token,
						fetchApi: fetch
					}).searchTag(validationsResult.data.name);
				}
			},
			errorSchema: searchTagSchema
		});

		return namedActionResult(result, 'search');
	}
} satisfies Actions;
