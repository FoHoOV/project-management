import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load = (async ({ parent, params }) => {
	const data = await parent();

	const currentProject = data.projects.find((value) => {
		return value.id.toString() === params.project_id;
	});

	if (!currentProject) {
		error(404, 'project not found');
	}

	return {
		currentProject
	};
}) satisfies LayoutLoad;
