import type { LayoutLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ parent }) => {
	const { username } = await parent();
	if (!username) {
		redirect(303, '/login');
	}
}) satisfies LayoutLoad;
