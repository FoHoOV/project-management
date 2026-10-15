import { redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { validateFormActionRequest } from '$lib/actions/form';
import { schema } from './validators';
import { UserCreate } from '$lib/generated-client/zod.gen';
import { callServiceInFormActions } from '$lib/client-wrapper/wrapper.server';
import { createApiClient } from '$lib/client-wrapper/clients';
import { signupUsers } from '$lib/generated-client';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const validation = await validateFormActionRequest(request, schema);

		if (!validation.success) {
			return validation.failure;
		}

		return await callServiceInFormActions({
			call: async () => {
				await signupUsers({
					client: createApiClient({ fetch }),
					body: validation.data,
					throwOnError: true
				});
				redirect(303, '/login');
			},
			errorSchema: UserCreate
		});
	}
} satisfies Actions;
