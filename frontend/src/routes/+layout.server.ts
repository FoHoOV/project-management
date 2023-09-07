import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {
	return { token: locals.token };
}) satisfies LayoutServerLoad;
