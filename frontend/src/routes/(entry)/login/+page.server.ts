import { type Actions, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { SERVER_ONLY_KEYS } from '#lib/constants/cookie.server.js';
import { superFail, validateFormActionRequest } from '#lib/actions/form/index.js';
import { schema } from './validators';
import { Body_login_for_access_token_OAuth } from '#lib/generated-client/zod.gen.js';
import { superApplyAction, callServiceInFormActions } from '#lib/client-wrapper/wrapper.server.js';
import { ErrorType } from '#lib/client-wrapper/wrapper.universal.js';
import { createServerApiClient } from '#lib/client-wrapper/clients.server.js';
import { loginForAccessTokenOAuth } from '#lib/generated-client/index.js';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;
export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const validation = await validateFormActionRequest(request, schema);

		if (!validation.success) {
			return validation.failure;
		}

		return await callServiceInFormActions({
			call: async () => {
				const token = await loginForAccessTokenOAuth({
					client: createServerApiClient(),
					body: validation.data
				});
				cookies.set(SERVER_ONLY_KEYS.token, JSON.stringify(token), {
					secure: true,
					httpOnly: true,
					path: '/'
				});
				redirect(303, '/user/projects');
			},
			errorHandler: async (e) => {
				if (e.type === ErrorType.NOT_AUTHENTICATED) {
					e.preventDefaultHandler = true;
					return superFail(400, {
						message: (e.data as any).detail as string
					});
				}
				return await superApplyAction<typeof Body_login_for_access_token_OAuth>(e);
			},
			errorSchema: Body_login_for_access_token_OAuth
		});
	}
} satisfies Actions;
