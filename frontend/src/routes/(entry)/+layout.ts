import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load = (async ({ parent }) => {
	const data = await parent();
	if (data.token) {
		redirect(303, '/user/logout');
	}
}) satisfies LayoutLoad;
