import type { LayoutLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ parent, data }) => {
	const parentData = await parent();
	if (!parentData.token) {
		throw redirect(303, '/login');
	}
	return { ...data, ...parentData };
}) satisfies LayoutLoad;
