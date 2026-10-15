import { validateFormActionRequest, namedActionResult } from '#lib';
import { createApiClient } from '#lib/client-wrapper/clients.js';
import { detachFromUserProjects, updatePermissions } from '#lib/generated-client/index.js';
import { callServiceInFormActions } from '#lib/client-wrapper/wrapper.server.js';
import { ProjectUpdateUserPermissions } from '#lib/generated-client/zod.gen.js';
import type { Actions } from './$types';
import { detachSchema, updateUserPermissionsSchema } from './validator';

export const actions: Actions = {
	detach: async ({ request, fetch }) => {
		const validation = await validateFormActionRequest(request, detachSchema);

		if (!validation.success) {
			return validation.failure;
		}

		const result = await callServiceInFormActions({
			call: async () => {
				return await detachFromUserProjects({
					client: createApiClient(fetch),
					path: validation.data
				});
			},
			errorSchema: detachSchema
		});

		return namedActionResult(result, 'detach');
	},
	updatePermissions: async ({ request, fetch }) => {
		const validation = await validateFormActionRequest(request, updateUserPermissionsSchema);

		if (!validation.success) {
			return validation.failure;
		}

		const result = await callServiceInFormActions({
			call: async () => {
				return await updatePermissions({
					client: createApiClient(fetch),
					path: { project_id: validation.data.project_id },
					body: validation.data
				});
			},
			errorSchema: ProjectUpdateUserPermissions
		});

		return namedActionResult(result, 'updatePermissions');
	}
} satisfies Actions;
