import { createApiClient } from '$lib/client-wrapper/clients';
import { attachToUserProjects, createForUserProjects, updateProjects } from '$lib/generated-client';
import { callServiceInFormActions } from '$lib/client-wrapper/wrapper.server';
import type { Actions } from '@sveltejs/kit';
import { attachProjectSchema, createProjectSchema, editProjectSchema } from './validator';
import { namedActionResult, validateFormActionRequest } from '$lib';
import {
	ProjectAttachAssociation,
	ProjectCreate,
	ProjectUpdate
} from '$lib/generated-client/zod.gen';

export const actions = {
	create: async ({ request, locals, fetch }) => {
		const validation = await validateFormActionRequest(request, createProjectSchema);

		if (!validation.success) {
			return validation.failure;
		}

		const result = await callServiceInFormActions({
			call: async () => {
				const { data } = await createForUserProjects({
					client: createApiClient({ token: locals.token, fetch }),
					body: { ...validation.data },
					throwOnError: true
				});
				return data;
			},
			errorSchema: ProjectCreate
		});

		return namedActionResult(result, 'create');
	},
	attach: async ({ request, locals, fetch }) => {
		const validation = await validateFormActionRequest(request, attachProjectSchema);

		if (!validation.success) {
			return validation.failure;
		}

		const result = await callServiceInFormActions({
			call: async () => {
				const { data } = await attachToUserProjects({
					client: createApiClient({ token: locals.token, fetch }),
					path: { project_id: validation.data.project_id },
					body: { ...validation.data },
					throwOnError: true
				});
				return data;
			},
			errorSchema: ProjectAttachAssociation
		});

		return namedActionResult(result, 'attach');
	},
	edit: async ({ request, locals, fetch }) => {
		const validation = await validateFormActionRequest(request, editProjectSchema);

		if (!validation.success) {
			return validation.failure;
		}

		const result = await callServiceInFormActions({
			call: async () => {
				const { data } = await updateProjects({
					client: createApiClient({ token: locals.token, fetch }),
					path: { project_id: validation.data.project_id },
					body: { ...validation.data },
					throwOnError: true
				});
				return data;
			},
			errorSchema: ProjectUpdate
		});

		return namedActionResult(result, 'edit');
	}
} satisfies Actions;
