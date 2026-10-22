import { resolve } from '$app/paths';
import type { ResolvedPathname, RouteParams } from '$app/types';

export type ProjectRouteParams = RouteParams<'/user/[project_name]-[project_id=integer]/todos'>;

function projectRouteParams(projectName: string, projectId: number | string): ProjectRouteParams {
	return { project_name: projectName.replaceAll(' ', ''), project_id: projectId.toString() };
}

export function generateTodoListItemsUrl(
	projectName: string,
	projectId: number | string
): ResolvedPathname {
	return resolve(
		'/user/[project_name]-[project_id=integer]/todos',
		projectRouteParams(projectName, projectId)
	);
}

export function generateTodoListSettingsUrl(
	projectName: string,
	projectId: number | string
): ResolvedPathname {
	return resolve(
		'/user/[project_name]-[project_id=integer]/settings',
		projectRouteParams(projectName, projectId)
	);
}
