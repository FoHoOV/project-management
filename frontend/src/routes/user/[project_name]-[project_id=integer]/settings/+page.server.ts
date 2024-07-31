import { validateFormActionRequest, namedActionResult } from '$lib';
import { PermissionClient, ProjectClient } from '$lib/client-wrapper/clients';
import { callServiceInFormActions } from '$lib/client-wrapper/wrapper.server';
import { ProjectUpdateUserPermissions } from '$lib/generated-client/zod/schemas';
import type { Actions } from './$types';
import { detachSchema, updateUserPermissionsSchema } from './validator';

export const actions: Actions = {
	detach: async ({ request, locals }) => {
		const validation = await validateFormActionRequest(request, detachSchema);

		if (!validation.success) {
			return validation.failure;
		}

		const result = await callServiceInFormActions({
			call: async () => {
				return await ProjectClient({
					token: locals.token,
					fetchApi: fetch
				}).detachFromUserProjects(validation.data.projectId, validation.data.userId);
			},
			errorSchema: detachSchema
		});

		return namedActionResult(result, 'detach');
	},
	updatePermissions: async ({ request, locals }) => {
		const validation = await validateFormActionRequest(request, updateUserPermissionsSchema);

		if (!validation.success) {
			return validation.failure;
		}

		const result = await callServiceInFormActions({
			call: async () => {
				return await PermissionClient({
					token: locals.token,
					fetchApi: fetch
				}).updatePermissions(validation.data.project_id, {
					...validation.data
				});
			},
			errorSchema: ProjectUpdateUserPermissions
		});

		return namedActionResult(result, 'updatePermissions');
	}
} satisfies Actions;
