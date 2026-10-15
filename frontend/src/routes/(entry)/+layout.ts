import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load = (async ({ parent }) => {
	const data = await parent();
	if (data.username) {
		redirect(303, '/user/logout');
	}
}) satisfies LayoutLoad;
