import { ProjectClient } from '$lib/client-wrapper/clients';
import { callServiceInFormActions } from '$lib/client-wrapper';
import type { Actions } from '@sveltejs/kit';
import { attachProjectSchema, createProjectSchema, editProjectSchema } from './validator';
import { convertFormDataToObject, namedActionResult, superFail } from '$lib';
import {
	ProjectAttachAssociation,
	ProjectCreate,
	ProjectUpdate
} from '$lib/generated-client/zod/schemas';

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

		const result = await callServiceInFormActions({
			serviceCall: async () => {
				return await ProjectClient({
					token: locals.token,
					fetchApi: fetch
				}).createForUserProject({
					...validationsResult.data
				});
			},
			errorSchema: ProjectCreate
		});

		return namedActionResult(result, 'create');
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
		const result = await callServiceInFormActions({
			serviceCall: async () => {
				return await ProjectClient({
					token: locals.token,
					fetchApi: fetch
				}).attachToUserProject({
					...validationsResult.data
				});
			},
			errorSchema: ProjectAttachAssociation
		});

		return namedActionResult(result, 'attach');
	},
	edit: async ({ request, locals, fetch }) => {
		const formData = await request.formData();

		const validationsResult = await editProjectSchema.safeParseAsync(
			convertFormDataToObject(formData)
		);

		if (!validationsResult.success) {
			return superFail(400, {
				message: 'Invalid form, please review your inputs',
				error: validationsResult.error.flatten().fieldErrors
			});
		}
		const result = await callServiceInFormActions({
			serviceCall: async () => {
				return await ProjectClient({
					token: locals.token,
					fetchApi: fetch
				}).updateProject({
					...validationsResult.data
				});
			},
			errorSchema: ProjectUpdate
		});

		return namedActionResult(result, 'edit');
	}
} satisfies Actions;
