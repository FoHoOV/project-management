import type { PageServerLoad } from './$types';
import { ProjectClient } from '$lib/client-wrapper/clients';
import { callService, callServiceInFormActions } from '$lib/client-wrapper';
import { error, type Actions } from '@sveltejs/kit';
import { attachProjectSchema, createProjectSchema } from './validator';
import { convertFormDataToObject, superFail } from '$lib';
import { ProjectAttachAssociation, ProjectCreate } from '$lib/client/zod/schemas';

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

export const actions = {
	create: async ({ request, locals, fetch }) => {
		const formData = await request.formData();

		const validationsResult = await createProjectSchema.safeParseAsync(
			convertFormDataToObject(formData)
		);

		if (!validationsResult.success) {
			return superFail(400, {
				message: 'Invalid form, please review your inputs',
				error: validationsResult.error.flatten().fieldErrors
			});
		}

		return {
			create: await callServiceInFormActions({
				serviceCall: async () => {
					return await ProjectClient({
						token: locals.token,
						fetchApi: fetch
					}).createForUserProject({
						...validationsResult.data
					});
				},
				errorSchema: ProjectCreate
			})
		};
	},
	attach: async ({ request, locals, fetch }) => {
		const formData = await request.formData();

		const validationsResult = await attachProjectSchema.safeParseAsync(
			convertFormDataToObject(formData)
		);

		if (!validationsResult.success) {
			return superFail(400, {
				message: 'Invalid form, please review your inputs',
				error: validationsResult.error.flatten().fieldErrors
			});
		}

		return {
			attach: await callServiceInFormActions({
				serviceCall: async () => {
					return await ProjectClient({
						token: locals.token,
						fetchApi: fetch
					}).attachToUserProject({
						...validationsResult.data
					});
				},
				errorSchema: ProjectAttachAssociation
			})
		};
	}
} satisfies Actions;
