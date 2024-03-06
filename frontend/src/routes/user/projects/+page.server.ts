import { ProjectClient } from '$lib/client-wrapper/clients';
import { callServiceInFormActions } from '$lib/client-wrapper/wrapper.server';
import type { Actions } from '@sveltejs/kit';
import { attachProjectSchema, createProjectSchema, editProjectSchema } from './validator';
import { namedActionResult, validateFormActionRequest } from '$lib';
import {
	ProjectAttachAssociation,
	ProjectCreate,
	ProjectUpdate
} from '$lib/generated-client/zod/schemas';

export const actions = {
	create: async ({ request, locals, fetch }) => {
		const validation = await validateFormActionRequest(request, createProjectSchema);

		if (!validation.success) {
			return validation.failure;
		}

		const result = await callServiceInFormActions({
			call: async () => {
				return await ProjectClient({
					token: locals.token,
					fetchApi: fetch
				}).createForUserProject({
					...validation.data
				});
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
				return await ProjectClient({
					token: locals.token,
					fetchApi: fetch
				}).attachToUserProject({
					...validation.data
				});
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
				return await ProjectClient({
					token: locals.token,
					fetchApi: fetch
				}).updateProject({
					...validation.data
				});
			},
			errorSchema: ProjectUpdate
		});

		return namedActionResult(result, 'edit');
	}
} satisfies Actions;
